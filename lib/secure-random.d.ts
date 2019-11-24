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
export declare function rng_seed_time(): void;
export default class SecureRandom {
    nextBytes: (ba: Array<number>) => void;
    constructor();
}
export declare class Arcfour {
    i: number;
    j: number;
    S: Array<number>;
    init(key: Array<number>): void;
    next(): number;
}
