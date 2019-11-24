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
import { IAlgorithm } from './algorithms';
import SecureRandom from './secure-random';
export default class BigInteger {
    [key: number]: number;
    static ZERO: BigInteger;
    static ONE: BigInteger;
    DB: number;
    DM: number;
    DV: number;
    FV: number;
    F1: number;
    F2: number;
    am: (i: number, x: number, w: BigInteger, j: number, c: number, n: number) => number;
    t: number;
    s: number;
    constructor(a: number | string | Array<number> | null, b?: number | SecureRandom, c?: number | SecureRandom);
    fromString(s: string | Array<number>, b: number, signed?: boolean): void;
    clamp(): void;
    copyTo(r: BigInteger): void;
    fromInt(x: number): void;
    chunkSize(r: number): number;
    toRadix(b: number): string;
    fromRadix(s: string, b: number): void;
    fromNumber(a: number, b: number | SecureRandom, c?: number | SecureRandom): void;
    bitwiseTo(a: BigInteger, op: (x: number, y: number) => number, r: BigInteger): void;
    changeBit(n: number, op: (x: number, y: number) => number): BigInteger;
    addTo(a: BigInteger, r: BigInteger): void;
    dMultiply(n: number): void;
    dAddOffset(n: number, w: number): void;
    multiplyLowerTo(a: BigInteger, n: number, r: BigInteger): void;
    multiplyUpperTo(a: BigInteger, n: number, r: BigInteger): void;
    modInt(n: number): number;
    millerRabin(t: number): boolean;
    compareTo(a: BigInteger): number;
    mod(a: BigInteger): BigInteger;
    squareTo(r: BigInteger): void;
    dlShiftTo(n: number, r: BigInteger): void;
    drShiftTo(n: number, r: BigInteger): void;
    lShiftTo(n: number, r: BigInteger): void;
    rShiftTo(n: number, r: BigInteger): void;
    subTo(a: BigInteger, r: BigInteger): void;
    multiplyTo(a: BigInteger, r: BigInteger): void;
    divRemTo(m: BigInteger, q: BigInteger | null, r: BigInteger | null): void;
    invDigit(): number;
    isEven(): boolean;
    exp(e: number, z: IAlgorithm): BigInteger;
    modPowInt(e: number, m: BigInteger): BigInteger;
    toString(b: number): string;
    negate(): BigInteger;
    abs(): BigInteger;
    bitLength(): number;
    clone(): BigInteger;
    intValue(): number;
    byteValue(): number;
    shortValue(): number;
    sigNum(): number;
    toByteArray(signed: boolean): Array<number>;
    equals(a: BigInteger): boolean;
    min(a: BigInteger): BigInteger;
    max(a: BigInteger): BigInteger;
    add(a: BigInteger): BigInteger;
    subtract(a: BigInteger): BigInteger;
    multiply(a: BigInteger): BigInteger;
    square(): BigInteger;
    divide(a: BigInteger): BigInteger;
    remainder(a: BigInteger): BigInteger;
    divideAndRemainder(a: BigInteger): Array<BigInteger>;
    pow(e: number): BigInteger;
    modPow(e: BigInteger, m: BigInteger): BigInteger;
    GCD(a: BigInteger): BigInteger;
    modInverse(m: BigInteger): BigInteger;
    isProbablePrime(t: number): boolean;
    and(a: BigInteger): BigInteger;
    or(a: BigInteger): BigInteger;
    xor(a: BigInteger): BigInteger;
    andNot(a: BigInteger): BigInteger;
    not(): BigInteger;
    shiftLeft(n: number): BigInteger;
    shiftRight(n: number): BigInteger;
    getLowestSetBit(): number;
    bitCount(): number;
    testBit(n: number): boolean;
    setBit(n: number): BigInteger;
    clearBit(n: number): BigInteger;
    flipBit(n: number): BigInteger;
}
