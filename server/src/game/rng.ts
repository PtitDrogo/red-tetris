export type RNGResult = {
    value: number; // A float in [0, 1)
    nextSeed: number;
};

//Mulberry32 algorithm
export function rng(seed: number): RNGResult {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let z = seed;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    const value = ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
    return { value, nextSeed: seed };
}

//Probably dumb functions, just here to I remember.
export function randomIndex(value: number, arrayLength: number): number {
  return Math.floor(value * arrayLength);
}