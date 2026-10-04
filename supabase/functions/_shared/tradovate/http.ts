// ============================================================================
// Tradovate HTTP transport.
//
// One place that knows how to talk to the REST API:
//   * acquires a rate-limit slot before every attempt,
//   * retries plain 429s with exponential backoff,
//   * on {p-time,p-ticket} waits then resends the identical body with the
//     ticket merged in,
//   * surfaces {p-captcha} as a CircuitOpenError (caller stops for ~1h).
//
// `fetchImpl` and the limiter are injectable so unit tests never touch the
// network and never actually sleep.
// ============================================================================

import {
  CircuitOpenError,
  parseTimePenalty,
  TradovateRateLimiter,
} from "./rateLimiter.ts";

export class TradovateHttpError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "TradovateHttpError";
  }
}

export interface JsonRequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  /** JSON body; merged with p-ticket on a penalty retry. */
  body?: Record<string, unknown> | null;
  limiter: TradovateRateLimiter;
  fetchImpl?: typeof fetch;
  /** Total attempts including the first. */
  maxAttempts?: number;
  signal?: AbortSignal;
}

/**
 * Perform a JSON request with full rate-limit handling. Returns the parsed
 * body on 2xx; throws TradovateHttpError otherwise.
 */
export async function requestJson<T = unknown>(
  opts: JsonRequestOptions,
): Promise<T> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const maxAttempts = opts.maxAttempts ?? 6;
  const method = opts.method ?? "POST";
  let body = opts.body ?? null;
  let attempts = 0;

  for (;;) {
    attempts += 1;
    opts.limiter.assertCircuitClosed();
    await opts.limiter.waitForSlot();

    const res = await fetchImpl(opts.url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
      },
      body: body === null ? undefined : JSON.stringify(body),
      signal: opts.signal,
    });

    // 429 — either a structured time penalty or a plain throttle.
    if (res.status === 429) {
      const parsed = await safeJson(res);
      const penalty = parseTimePenalty(parsed);
      if (penalty && !penalty.captcha && attempts < maxAttempts) {
        const ticket = await opts.limiter.handlePenalty(penalty);
        if (ticket) {
          body = { ...(body ?? {}), "p-ticket": ticket };
        }
        continue;
      }
      if (penalty && penalty.captcha) {
        // Opens the circuit and throws.
        await opts.limiter.handlePenalty(penalty);
      }
      if (attempts < maxAttempts) {
        await opts.limiter.backoffFor429();
        continue;
      }
      throw new TradovateHttpError(
        429,
        parsed,
        "Tradovate rate limit persisted beyond retry budget",
      );
    }

    if (!res.ok) {
      throw new TradovateHttpError(
        res.status,
        await safeJson(res),
        `Tradovate HTTP ${res.status}`,
      );
    }

    opts.limiter.onSuccess();
    return (await safeJson(res)) as T;
  }
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export { CircuitOpenError };
