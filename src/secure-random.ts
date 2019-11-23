/*!
 * JavaScript BigInteger
 * https://github.com/modern-dev/jsbn
 *
 * Copyright (c) 2019 Bohdan Shtepan
 * Licensed under a BSD license.
 *
 * Original copyright
 * Copyright (c) 2003-2005 Tom Wu
 * All Rights Reserved.
 */

let rng_state: Arcfour | null = null;
let rng_pool: Array<number>;
let rng_pptr: number = 0;

// Pool size must be a multiple of 4 and greater than 32.
// An array of bytes the size of the pool will be passed to init()
const rng_psize = 256;

// Initialize the pool with junk if needed.
// @ts-ignore
if (typeof rng_pool === 'undefined') {
  rng_pool = [];
  let t;

  if (typeof window !== 'undefined' && window.crypto) {
    if (window.crypto.getRandomValues) {
      // Use webcrypto if available
      let ua = new Uint8Array(32);

      window.crypto.getRandomValues(ua);

      for (t = 0; t < 32; ++t) {
        rng_pool[rng_pptr++] = ua[t];
      }
    } else if (navigator.appName === 'Netscape' && navigator.appVersion < '5') {
      // Extract entropy (256 bits) from NS4 RNG if available
      // @ts-ignore
      const z = window.crypto.random(32);

      for (t = 0; t < z.length; ++t)
        rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
    }
  }
  while (rng_pptr < rng_psize) { // extract some randomness from Math.random()
    t = Math.floor(65536 * Math.random());
    rng_pool[rng_pptr++] = t >>> 8;
    rng_pool[rng_pptr++] = t & 255;
  }
  rng_pptr = 0;
  rng_seed_time();
  //rng_seed_int(window.screenX);
  //rng_seed_int(window.screenY);
}

// Mix in a 32-bit integer into the pool
function rng_seed_int(x: number): void {
  rng_pool[rng_pptr++] ^= x & 255;
  rng_pool[rng_pptr++] ^= (x >> 8) & 255;
  rng_pool[rng_pptr++] ^= (x >> 16) & 255;
  rng_pool[rng_pptr++] ^= (x >> 24) & 255;

  if (rng_pptr >= rng_psize) {
    rng_pptr -= rng_psize;
  }
}

function rng_get_byte(): number {
  if (rng_state === null) {
    rng_seed_time();
    rng_state = prng_newstate();
    rng_state.init(rng_pool);

    for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) {
      rng_pool[rng_pptr] = 0;
    }

    rng_pptr = 0;
    //rng_pool = null;
  }

  // TODO: allow reseeding after first request
  return rng_state.next();
}

function rng_get_bytes(ba: Array<number>): void {
  let i;

  for (i = 0; i < ba.length; ++i) {
    ba[i] = rng_get_byte();
  }
}

// Plug in your RNG constructor here
function prng_newstate(): Arcfour {
  return new Arcfour();
}

// For best results, put code like
// <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
// in your main HTML document.
// Mix in the current time (w/milliseconds) into the pool
export function rng_seed_time(): void {
  rng_seed_int(new Date().getTime());
}

export default class SecureRandom {
  public nextBytes: (ba: Array<number>) => void;

  constructor() {
    this.nextBytes = rng_get_bytes;
  }
}

export class Arcfour {
  i: number = 0;
  j: number = 0;
  S: Array<number> = [];

  init(key: Array<number>): void {
    let i, j, t;

    for (i = 0; i < 256; ++i) {
      this.S[i] = i;
    }

    j = 0;

    for (i = 0; i < 256; ++i) {
      j = (j + this.S[i] + key[i % key.length]) & 255;
      t = this.S[i];

      this.S[i] = this.S[j];
      this.S[j] = t;
    }

    this.i = 0;
    this.j = 0;
  }

  next(): number {
    let t;

    this.i = (this.i + 1) & 255;
    this.j = (this.j + this.S[this.i]) & 255;

    t = this.S[this.i];

    this.S[this.i] = this.S[this.j];
    this.S[this.j] = t;

    return this.S[(t + this.S[this.i]) & 255];
  }
}
