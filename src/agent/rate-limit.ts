export class RateLimiter {
  private timestamps: number[] = [];
  constructor(private readonly maxPerWindow: number, private readonly windowMs: number) {}
  allow(now = Date.now()): boolean {
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxPerWindow) return false;
    this.timestamps.push(now);
    return true;
  }
}
