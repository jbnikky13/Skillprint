# Gmail OAuth setup

## 1. Set the exact redirect URI

For the current production Vercel domain, set `GOOGLE_GMAIL_REDIRECT_URI` in Vercel to:

```text
https://skillprint-wine.vercel.app/api/gmail/callback
```

In Google Cloud Console, open **Google Auth Platform → Clients**, edit the Web application OAuth client, and add that exact value under **Authorized redirect URIs**. The scheme, hostname, path, and trailing slash must match exactly.

## 2. Confirm Vercel environment variables

The server-side variables are:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only)
- `GMAIL_TOKEN_ENCRYPTION_KEY` (64 hex characters)
- `GMAIL_OAUTH_STATE_SECRET`
- `GOOGLE_GMAIL_CLIENT_ID`
- `GOOGLE_GMAIL_CLIENT_SECRET` (server-only)
- `GOOGLE_GMAIL_REDIRECT_URI` (the exact URL above)
- `SKILLPRINT_ALLOW_LIVE_SUBMIT=false`

Set these in Vercel Production. Preview deployments need their own matching callback URI and Google OAuth client configuration if you want to test Gmail OAuth there.

## 3. Create the connection table

Open the Supabase project → **SQL Editor**, and run the SQL in [gmail-oauth-setup.sql](./gmail-oauth-setup.sql). The table has row-level security enabled and no end-user policies; only server-side service-role code should read/write encrypted tokens.

## 4. Google setup

In Google Cloud Console, enable the **Gmail API**. Configure the OAuth consent screen and add your own Google account as a test user if the app is still in Testing. The app requests read-only Gmail access plus basic OpenID/email identity scopes.

## 5. Redeploy and test

After saving environment variables and the Google redirect URI, redeploy the production deployment. Open the dashboard, sign in with your Skillprint Supabase account, and choose **Connect Gmail**. Approve the requested access and confirm the dashboard reports the connected Gmail address.

If the callback fails, check Vercel **Runtime Logs** for the Gmail OAuth callback failure entry. Do not share tokens or secret values in screenshots or chat.

Live job submission remains disabled while Gmail OAuth is being validated.
