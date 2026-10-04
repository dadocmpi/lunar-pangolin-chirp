// ============================================================================
// Tradovate rate limiting.
//
// Tradovate throttles requests on rolling second/minute/hour windows and
// answers a breach with HTTP 429. "Novel" operations (notably token requests)
// additionally return a structured time penalty:
//
//   { "p-ticket": "<opaque>", "p-time": <seconds>, "p-captcha": <boolean> }
//
// The correct client behaviour, per Tradovate's API docs:
//   * 429                        -> back off, then retry the same request.
//   * p-time / p-ticket          -> wait p-time seconds, resend the *identical*
//                                   request with p-ticket added to the JSON body.
//   * p-captcha === true         -> a third-party app cannot complete the call;
//                                   stop hammering and retry in ~1 hour.
//
// This module implements:
//   * a rolling-window limiter that keeps us below the published ceilings,
//   * exponential backoff with jitter for plain 429s,
//   * p-time/p-ticket resend support,
//   * a ~1h circuit breaker for p-captcha (and for repeated 429s).
//
// It is runtime-agnostic and takes injectable sleep/now so unit tests run in
// milliseconds instead of minutes.
// ============================================================================

export interface TimePenalty {
  ticket: string | null;
  /** Seconds to wait before retrying. */
  waitSeconds: number;
  captcha: boolean;
}

export interface RateLimiterOptions {
  requestsPerSecond?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
  /** Circuit-open duration after p-captcha. Default 1 hour. */
  captchaCircuitMs?: number;
  /** Circuit-open duration after repeated plain 429s. Default 60s. */
  rateLimitCircuitMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  random?: () => number;
}

export class CircuitOpenError extends Error {
  constructor(public retryAfterMs: number) {
    super(`rate-limit circuit open for another ${retryAfterMs}ms`);
    this.name = "CircuitOpenError";
  }
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));

/**
 * Parse a Tradovate time-penalty body. Returns null when the body is not a
 * penalty object. Accepts the hyphenated keys exactly as Tradovate sends them.
 */
export function parseTimePenalty(body: unknown): TimePenalty | null {
  if (!body || typeof body !== "object") return null;
  const rec = body as Record<string, unknown>;
  const hasTicket = "p-ticket" in rec;
  const hasTime = "p-time" in rec;
  const hasCaptcha = "p-captcha" in rec;
  if (!hasTicket && !hasTime && !hasCaptcha) return null;

  const rawTime = rec["p-time"];
  const waitSeconds = typeof rawTime === "number" && Number.isFinite(rawTime)
    ? Math.max(0, rawTime)
    : 0;
  const ticket = typeof rec["p-ticket"] === "string" ? rec["p-ticket"] : null;
  const captcha = rec["p-captcha"] === true;
  return { ticket, waitSeconds, captcha };
}

export class TradovateRateLimiter {
  private readonly perSecond: number;
  private readonly perMinute: number;
  private readonly perHour: number;
  private readonly baseBackoffMs: number;
  private readonly maxBackoffMs: number;
  private readonly captchaCircuitMs: number;
  private readonly rateLimitCircuitMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly random: () => number;

  /** Timestamps (ms) of accepted requests within the last hour. */
  private history: number[] = [];
  private circuitOpenUntil = 0;
  /** Consecutive plain-429 counter, reset on success. */
  private consecutive429 = 0;

  constructor(opts: RateLimiterOptions = {}) {
    this.perSecond = opts.requestsPerSecond ?? 4;
    this.perMinute = opts.requestsPerMinute ?? 60;
    this.perHour = opts.requestsPerHour ?? 4500;
    this.baseBackoffMs = opts.baseBackoffMs ?? 500;
    this.maxBackoffMs = opts.maxBackoffMs ?? 30_000;
    this.captchaCircuitMs = opts.captchaCircuitMs ?? HOUR;
    this.rateLimitCircuitMs = opts.rateLimitCircuitMs ?? MINUTE;
    this.sleep = opts.sleep ?? defaultSleep;
    this.now = opts.now ?? (() => Date.now());
    this.random = opts.random ?? Math.random;
  }

  /** Throw CircuitOpenError while a p-captcha / repeated-429 circuit is open. */
  assertCircuitClosed(): void {
    const remaining = this.circuitOpenUntil - this.now();
    if (remaining > 0) throw new CircuitOpenError(remaining);
  }

  isCircuitOpen(): boolean {
    return this.circuitOpenUntil > this.now();
  }

  /** Wait until all three rolling windows allow one more request. */
  async waitForSlot(): Promise<void> {
    this.assertCircuitClosed();
    // Loop because sleeping for the longest window can still leave a shorter
    // window saturated (e.g. a burst right after a long pause).
    for (;;) {
      const now = this.now();
      this.history = this.history.filter((t) => now - t < HOUR);
      const waits = [
        this.windowWait(now, SECOND, this.perSecond),
        this.windowWait(now, MINUTE, this.perMinute),
        this.windowWait(now, HOUR, this.perHour),
      ];
      const wait = Math.max(0, ...waits);
      if (wait <= 0) break;
      await this.sleep(wait);
      this.assertCircuitClosed();
    }
    this.history.push(this.now());
  }

  private windowWait(now: number, windowMs: number, limit: number): number {
    const inWindow = this.history.filter((t) => now - t < windowMs);
    if (inWindow.length < limit) return 0;
    // Oldest entry in this window frees a slot when it ages out.
    const oldest = Math.min(...inWindow);
    return oldest + windowMs - now;
  }

  /** Exponential backoff with jitter for a plain 429. */
  async backoffFor429(): Promise<number> {
    this.consecutive429 += 1;
    if (this.consecutive429 >= 5) {
      // Sustained flooding: open a circuit instead of retrying forever.
      this.circuitOpenUntil = this.now() + this.rateLimitCircuitMs;
    }
    const exp = Math.min(
      this.maxBackoffMs,
      this.baseBackoffMs * 2 ** (this.consecutive429 - 1),
    );
    const jitter = Math.floor(this.random() * (exp / 2));
    const wait = exp + jitter;
    await this.sleep(wait);
    return wait;
  }

  /**
   * Handle a p-time / p-ticket penalty. Returns the ticket the caller must
   * echo back in the request body. Opens the circuit (and throws) on captcha.
   */
  async handlePenalty(penalty: TimePenalty): Promise<string | null> {
    if (penalty.captcha) {
      this.circuitOpenUntil = this.now() + this.captchaCircuitMs;
      throw new CircuitOpenError(this.captchaCircuitMs);
    }
    if (penalty.waitSeconds > 0) {
      await this.sleep(penalty.waitSeconds * SECOND);
    }
    return penalty.ticket;
  }

  /** Reset the consecutive-429 counter after any successful call. */
  onSuccess(): void {
    this.consecutive429 = 0;
  }

  /** Test/diagnostic snapshot; contains no credentials. */
  snapshot() {
    return {
      historyLength: this.history.length,
      consecutive429: this.consecutive429,
      circuitOpenUntil: this.circuitOpenUntil,
      circuitOpen: this.isCircuitOpen(),
    };
  }
}

/**
 * Default limiter for a single user+environment. Kept below the commonly
 * observed ceilings (~80/min, ~5000/hr) with margin for the sync worker.
 */
export function createDefaultLimiter(
  opts: RateLimiterOptions = {},
): TradovateRateLimiter {
  return new TradovateRateLimiter({
    requestsPerSecond: 4,
    requestsPerMinute: 60,
    requestsPerHour: 4500,
    ...opts,
  });
}
