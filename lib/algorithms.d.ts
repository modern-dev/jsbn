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
import BigInteger from './big-integer';
export interface IAlgorithm {
    convert(x: BigInteger): BigInteger;
    revert(x: BigInteger): BigInteger;
    reduce(x: BigInteger): void;
    mulTo(x: BigInteger, y: BigInteger, r: BigInteger): void;
    sqrTo(x: BigInteger, r: BigInteger): void;
}
export declare class Classic implements IAlgorithm {
    m: BigInteger;
    constructor(m: BigInteger);
    convert(x: BigInteger): BigInteger;
    revert(x: BigInteger): BigInteger;
    reduce(x: BigInteger): void;
    mulTo(x: BigInteger, y: BigInteger, r: BigInteger): void;
    sqrTo(x: BigInteger, r: BigInteger): void;
}
export declare class Barrett implements IAlgorithm {
    m: BigInteger;
    r2: BigInteger;
    q3: BigInteger;
    mu: BigInteger;
    constructor(m: BigInteger);
    convert(x: BigInteger): BigInteger;
    revert(x: BigInteger): BigInteger;
    reduce(x: BigInteger): void;
    sqrTo(x: BigInteger, r: BigInteger): void;
    mulTo(x: BigInteger, y: BigInteger, r: BigInteger): void;
}
export declare class Montgomery implements IAlgorithm {
    m: BigInteger;
    mp: number;
    mpl: number;
    mph: number;
    um: number;
    mt2: number;
    constructor(m: BigInteger);
    convert(x: BigInteger): BigInteger;
    revert(x: BigInteger): BigInteger;
    reduce(x: BigInteger): void;
    sqrTo(x: BigInteger, r: BigInteger): void;
    mulTo(x: BigInteger, y: BigInteger, r: BigInteger): void;
}
export declare class NullExp implements IAlgorithm {
    convert(x: BigInteger): BigInteger;
    revert(x: BigInteger): BigInteger;
    mulTo(x: BigInteger, y: BigInteger, r: BigInteger): void;
    sqrTo(x: BigInteger, r: BigInteger): void;
    reduce(x: BigInteger): void;
}
