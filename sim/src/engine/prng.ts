/**
 * xoshiro128** — portable 32-bit seeded PRNG.
 *
 * Chosen per SIM_ENGINE_SPEC §1.1: platform-independent (identical output on
 * Node and browser), no crypto requirement, well-tested statistical properties.
 *
 * NO Math.random() anywhere in this file or any engine file.
 */

/** Four-element uint32 state vector for xoshiro128**. */
type State = [number, number, number, number];

/** Rotate left within 32 bits. */
function rotl(x: number, k: number): number {
  // >>> 0 forces unsigned 32-bit interpretation throughout.
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

/**
 * Splitmix32 — used to expand a single seed integer into the four-word
 * xoshiro128** state. This avoids a degenerate all-zero initial state and
 * produces good statistical coverage from small seeds.
 */
function splitmix32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = ((z ^ (z >>> 16)) * 0x85ebca6b) >>> 0;
    z = ((z ^ (z >>> 13)) * 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
}

/**
 * Hash a string seed into a uint32 using djb2.
 * Deterministic across platforms because it uses only integer arithmetic.
 */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    // | 0 keeps intermediate values in 32-bit signed range; >>> 0 normalises.
    h = (((h << 5) + h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Opaque PRNG handle returned by `seed()`. */
export interface Prng {
  /** Advance state; return raw uint32 in [0, 2^32). */
  nextUint32(): number;
  /** Float in [0, 1). */
  nextFloat(): number;
  /** Integer in [a, b] inclusive. */
  nextRange(a: number, b: number): number;
  /**
   * Sample from N(0,1) via Box-Muller transform.
   * Both output values are consumed — no caching — to keep state linear
   * and replay deterministic.
   */
  nextGaussian(): number;
  /**
   * Serialize state for save/restore (used by DT-005 PRNG-state tests).
   * The returned object is a plain JSON-safe value.
   */
  getState(): Readonly<State>;
  /** Restore a previously captured state. */
  setState(s: Readonly<State>): void;
}

/**
 * Create a seeded PRNG.
 *
 * @param rawSeed - A string (hashed to uint32) or a number (truncated to uint32).
 *                  The same seed always produces the same sequence.
 */
export function seed(rawSeed: string | number): Prng {
  const uint32Seed: number =
    typeof rawSeed === "string" ? hashString(rawSeed) : rawSeed >>> 0;

  // Expand seed into four independent words using splitmix32.
  const expand = splitmix32(uint32Seed);
  const state: State = [expand(), expand(), expand(), expand()];

  function nextUint32(): number {
    // xoshiro128** core — see https://prng.di.unimi.it/xoshiro128starstar.c
    const result = (rotl((state[1] * 5) >>> 0, 7) * 9) >>> 0;
    const t = (state[1] << 9) >>> 0;
    state[2] ^= state[0];
    state[3] ^= state[1];
    state[1] ^= state[2];
    state[0] ^= state[3];
    state[2] ^= t;
    state[3] = rotl(state[3], 11);
    return result;
  }

  function nextFloat(): number {
    // Divide by 2^32 to get [0, 1). The +0 forces a JS number (no coercion issue).
    return nextUint32() / 4294967296 + 0;
  }

  function nextRange(a: number, b: number): number {
    // Inclusive integer range [a, b].
    const range = Math.floor(b) - Math.ceil(a) + 1;
    return Math.ceil(a) + (nextUint32() % range);
  }

  function nextGaussian(): number {
    // Box-Muller: consumes two uniform draws, returns one N(0,1) sample.
    // We discard the second sample to keep state advancement deterministic
    // and linear — every nextGaussian() call always costs exactly 2 draws.
    const u1 = nextFloat() || 1e-10; // guard against log(0)
    const u2 = nextFloat();
    const mag = Math.sqrt(-2 * Math.log(u1));
    // Return only z0; z1 is intentionally discarded.
    return mag * Math.cos(2 * Math.PI * u2);
  }

  function getState(): Readonly<State> {
    return [...state] as State;
  }

  function setState(s: Readonly<State>): void {
    state[0] = s[0];
    state[1] = s[1];
    state[2] = s[2];
    state[3] = s[3];
  }

  return { nextUint32, nextFloat, nextRange, nextGaussian, getState, setState };
}
