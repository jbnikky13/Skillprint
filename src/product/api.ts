import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { APIKey, Account } from "./types.js";

export interface APIContext {
  account: Account;
  apiKey: APIKey;
}

export interface SkillprintAPI {
  version: "v1";
  authenticate(key: string): Promise<APIContext | null>;
}

export interface IssuedAPIKey extends APIKey {
  /** The secret is returned once at issuance and is never persisted by the registry. */
  secret: string;
}

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export class APIKeyRegistry {
  private keys = new Map<string, APIKey>();

  issue(accountId: string, label: string): IssuedAPIKey {
    const secret = "sk_" + randomBytes(32).toString("base64url");
    const key: APIKey = {
      id: randomUUID(),
      accountId,
      label,
      prefix: secret.slice(0, 10),
      createdAt: new Date().toISOString()
    };
    this.keys.set(digest(secret), key);
    return { ...key, secret };
  }

  revoke(id: string): void {
    for (const [hash, key] of this.keys) {
      if (key.id === id) this.keys.set(hash, { ...key, revokedAt: new Date().toISOString() });
    }
  }

  resolve(raw: string): APIKey | undefined {
    const key = this.keys.get(digest(raw));
    return key && !key.revokedAt ? key : undefined;
  }
}

export function createRegistryAPI(
  registry: APIKeyRegistry,
  findAccount: (accountId: string) => Promise<Account | undefined>
): SkillprintAPI {
  return {
    version: "v1",
    async authenticate(rawKey: string): Promise<APIContext | null> {
      if (!rawKey.startsWith("sk_")) return null;
      const apiKey = registry.resolve(rawKey);
      if (!apiKey) return null;
      const account = await findAccount(apiKey.accountId);
      return account?.status === "active" ? { account, apiKey } : null;
    }
  };
}
