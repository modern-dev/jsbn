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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./algorithms"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var algorithms_1 = require("./algorithms");
    var dbits;
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary & 0xffffff) === 0xefcafe);
    var BI_FP = 52;
    var am;
    var BI_RM = '0123456789abcdefghijklmnopqrstuvwxyz';
    var BI_RC = [];
    var rr, vv;
    rr = '0'.charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) {
        BI_RC[rr++] = vv;
    }
    rr = 'a'.charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) {
        BI_RC[rr++] = vv;
    }
    rr = 'A'.charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) {
        BI_RC[rr++] = vv;
    }
    var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
    var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
    var BitOps = {
        and: function (x, y) { return x & y; },
        or: function (x, y) { return x | y; },
        xor: function (x, y) { return x ^ y; },
        andNot: function (x, y) { return x & ~y; }
    };
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 0x4000000);
            w[j++] = v & 0x3ffffff;
        }
        return c;
    }
    function am2(i, x, w, j, c, n) {
        var xl = x & 0x7fff, xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 0x7fff;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 0x3fffffff;
        }
        return c;
    }
    function am3(i, x, w, j, c, n) {
        var xl = x & 0x3fff, xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 0x3fff;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 0xfffffff;
        }
        return c;
    }
    var inBrowser = typeof navigator !== 'undefined';
    if (inBrowser && j_lm && (navigator.appName === 'Microsoft Internet Explorer')) {
        am = am2;
        dbits = 30;
    }
    else if (inBrowser && j_lm && (navigator.appName !== 'Netscape')) {
        am = am1;
        dbits = 26;
    }
    else {
        am = am3;
        dbits = 28;
    }
    function nbi() {
        return new BigInteger(null);
    }
    function nbv(i) {
        var r = nbi();
        r.fromInt(i);
        return r;
    }
    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return (c === null) ? -1 : c;
    }
    function int2char(n) {
        return BI_RM.charAt(n);
    }
    function nbits(x) {
        var r = 1, t;
        if ((t = x >>> 16) !== 0) {
            x = t;
            r += 16;
        }
        if ((t = x >> 8) !== 0) {
            x = t;
            r += 8;
        }
        if ((t = x >> 4) !== 0) {
            x = t;
            r += 4;
        }
        if ((t = x >> 2) !== 0) {
            x = t;
            r += 2;
        }
        if ((t = x >> 1) !== 0) {
            x = t;
            r += 1;
        }
        return r;
    }
    function lbit(x) {
        if (x === 0) {
            return -1;
        }
        var r = 0;
        if ((x & 0xffff) === 0) {
            x >>= 16;
            r += 16;
        }
        if ((x & 0xff) === 0) {
            x >>= 8;
            r += 8;
        }
        if ((x & 0xf) === 0) {
            x >>= 4;
            r += 4;
        }
        if ((x & 3) === 0) {
            x >>= 2;
            r += 2;
        }
        if ((x & 1) === 0) {
            ++r;
        }
        return r;
    }
    function cbit(x) {
        var r = 0;
        while (x !== 0) {
            x &= x - 1;
            ++r;
        }
        return r;
    }
    var BigInteger = (function () {
        function BigInteger(a, b, c) {
            this.DB = dbits;
            this.DM = ((1 << dbits) - 1);
            this.DV = (1 << dbits);
            this.FV = Math.pow(2, BI_FP);
            this.F1 = BI_FP - dbits;
            this.F2 = 2 * dbits - BI_FP;
            this.am = am;
            if (a !== null)
                if ('number' === typeof a) {
                    this.fromNumber(a, b, c);
                }
                else if (b === null && 'string' !== typeof a) {
                    this.fromString(a, 256);
                }
                else {
                    this.fromString(a, b);
                }
        }
        Object.defineProperty(BigInteger, "ZERO", {
            get: function () {
                return nbv(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BigInteger, "ONE", {
            get: function () {
                return nbv(1);
            },
            enumerable: true,
            configurable: true
        });
        BigInteger.prototype.fromString = function (s, b, signed) {
            if (signed === void 0) { signed = false; }
            var k;
            if (b === 16) {
                k = 4;
            }
            else if (b === 8) {
                k = 3;
            }
            else if (b === 256) {
                k = 8;
            }
            else if (b === 2) {
                k = 1;
            }
            else if (b === 32) {
                k = 5;
            }
            else if (b === 4) {
                k = 2;
            }
            else {
                this.fromRadix(s, b);
                return;
            }
            this.t = 0;
            this.s = 0;
            var i = s.length, mi = false, sh = 0;
            while (--i >= 0) {
                var x = (k === 8) ? s[i] & 0xff : intAt(s, i);
                if (x < 0) {
                    if (s.charAt(i) === '-') {
                        mi = true;
                    }
                    continue;
                }
                mi = false;
                if (sh === 0) {
                    this[this.t++] = x;
                }
                else if (sh + k > this.DB) {
                    this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
                    this[this.t++] = (x >> (this.DB - sh));
                }
                else {
                    this[this.t - 1] |= x << sh;
                }
                sh += k;
                if (sh >= this.DB) {
                    sh -= this.DB;
                }
            }
            if (k === 8 && (s[0] & 0x80) !== 0 && signed) {
                this.s = -1;
                if (sh > 0) {
                    this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
                }
            }
            this.clamp();
            if (mi) {
                BigInteger.ZERO.subTo(this, this);
            }
        };
        BigInteger.prototype.clamp = function () {
            var c = this.s & this.DM;
            while (this.t > 0 && this[this.t - 1] === c) {
                --this.t;
            }
        };
        BigInteger.prototype.copyTo = function (r) {
            for (var i = this.t - 1; i >= 0; --i) {
                r[i] = this[i];
            }
            r.t = this.t;
            r.s = this.s;
        };
        BigInteger.prototype.fromInt = function (x) {
            this.t = 1;
            this.s = (x < 0) ? -1 : 0;
            if (x > 0) {
                this[0] = x;
            }
            else if (x < -1) {
                this[0] = x + this.DV;
            }
            else {
                this.t = 0;
            }
        };
        BigInteger.prototype.chunkSize = function (r) {
            return Math.floor(Math.LN2 * this.DB / Math.log(r));
        };
        BigInteger.prototype.toRadix = function (b) {
            if (b === null) {
                b = 10;
            }
            if (this.sigNum() === 0 || b < 2 || b > 36) {
                return '0';
            }
            var cs = this.chunkSize(b);
            var a = Math.pow(b, cs);
            var d = nbv(a), y = nbi(), z = nbi();
            var r = '';
            this.divRemTo(d, y, z);
            while (y.sigNum() > 0) {
                r = (a + z.intValue()).toString(b).substr(1) + r;
                y.divRemTo(d, y, z);
            }
            return z.intValue().toString(b) + r;
        };
        BigInteger.prototype.fromRadix = function (s, b) {
            this.fromInt(0);
            if (b === null) {
                b = 10;
            }
            var cs = this.chunkSize(b);
            var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
            for (var i = 0; i < s.length; ++i) {
                var x = intAt(s, i);
                if (x < 0) {
                    if (s.charAt(i) === '-' && this.sigNum() === 0) {
                        mi = true;
                    }
                    continue;
                }
                w = b * w + x;
                if (++j >= cs) {
                    this.dMultiply(d);
                    this.dAddOffset(w, 0);
                    j = 0;
                    w = 0;
                }
            }
            if (j > 0) {
                this.dMultiply(Math.pow(b, j));
                this.dAddOffset(w, 0);
            }
            if (mi) {
                BigInteger.ZERO.subTo(this, this);
            }
        };
        BigInteger.prototype.fromNumber = function (a, b, c) {
            if ('number' === typeof b) {
                if (a < 2) {
                    this.fromInt(1);
                }
                else {
                    this.fromNumber(a, c);
                    if (!this.testBit(a - 1)) {
                        this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), BitOps.or, this);
                    }
                    if (this.isEven()) {
                        this.dAddOffset(1, 0);
                    }
                    while (!this.isProbablePrime(b)) {
                        this.dAddOffset(2, 0);
                        if (this.bitLength() > a) {
                            this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
                        }
                    }
                }
            }
            else {
                var x = [], t = a & 7;
                x.length = (a >> 3) + 1;
                b.nextBytes(x);
                if (t > 0) {
                    x[0] &= ((1 << t) - 1);
                }
                else {
                    x[0] = 0;
                }
                this.fromString(x, 256);
            }
        };
        BigInteger.prototype.bitwiseTo = function (a, op, r) {
            var i, f, m = Math.min(a.t, this.t);
            for (i = 0; i < m; ++i) {
                r[i] = op(this[i], a[i]);
            }
            if (a.t < this.t) {
                f = a.s & this.DM;
                for (i = m; i < this.t; ++i) {
                    r[i] = op(this[i], f);
                }
                r.t = this.t;
            }
            else {
                f = this.s & this.DM;
                for (i = m; i < a.t; ++i) {
                    r[i] = op(f, a[i]);
                }
                r.t = a.t;
            }
            r.s = op(this.s, a.s);
            r.clamp();
        };
        BigInteger.prototype.changeBit = function (n, op) {
            var r = BigInteger.ONE.shiftLeft(n);
            this.bitwiseTo(r, op, r);
            return r;
        };
        BigInteger.prototype.addTo = function (a, r) {
            var i = 0, c = 0, m = Math.min(a.t, this.t);
            while (i < m) {
                c += this[i] + a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            if (a.t < this.t) {
                c += a.s;
                while (i < this.t) {
                    c += this[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c += this.s;
            }
            else {
                c += this.s;
                while (i < a.t) {
                    c += a[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c += a.s;
            }
            r.s = (c < 0) ? -1 : 0;
            if (c > 0) {
                r[i++] = c;
            }
            else if (c < -1) {
                r[i++] = this.DV + c;
            }
            r.t = i;
            r.clamp();
        };
        BigInteger.prototype.dMultiply = function (n) {
            this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
            ++this.t;
            this.clamp();
        };
        BigInteger.prototype.dAddOffset = function (n, w) {
            if (n === 0) {
                return;
            }
            while (this.t <= w) {
                this[this.t++] = 0;
            }
            this[w] += n;
            while (this[w] >= this.DV) {
                this[w] -= this.DV;
                if (++w >= this.t) {
                    this[this.t++] = 0;
                }
                ++this[w];
            }
        };
        BigInteger.prototype.multiplyLowerTo = function (a, n, r) {
            var i = Math.min(this.t + a.t, n);
            r.s = 0;
            r.t = i;
            while (i > 0) {
                r[--i] = 0;
            }
            var j;
            for (j = r.t - this.t; i < j; ++i) {
                r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
            }
            for (j = Math.min(a.t, n); i < j; ++i) {
                this.am(0, a[i], r, i, 0, n - i);
            }
            r.clamp();
        };
        BigInteger.prototype.multiplyUpperTo = function (a, n, r) {
            --n;
            var i = r.t = this.t + a.t - n;
            r.s = 0;
            while (--i >= 0) {
                r[i] = 0;
            }
            for (i = Math.max(n - this.t, 0); i < a.t; ++i) {
                r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
            }
            r.clamp();
            r.drShiftTo(1, r);
        };
        BigInteger.prototype.modInt = function (n) {
            if (n <= 0) {
                return 0;
            }
            var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
            if (this.t > 0)
                if (d === 0) {
                    r = this[0] % n;
                }
                else {
                    for (var i = this.t - 1; i >= 0; --i) {
                        r = (d * r + this[i]) % n;
                    }
                }
            return r;
        };
        BigInteger.prototype.millerRabin = function (t) {
            var n1 = this.subtract(BigInteger.ONE);
            var k = n1.getLowestSetBit();
            if (k <= 0) {
                return false;
            }
            var r = n1.shiftRight(k);
            t = (t + 1) >> 1;
            if (t > lowprimes.length) {
                t = lowprimes.length;
            }
            var a = nbi();
            for (var i = 0; i < t; ++i) {
                a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
                var y = a.modPow(r, this);
                if (y.compareTo(BigInteger.ONE) !== 0 && y.compareTo(n1) !== 0) {
                    var j = 1;
                    while (j++ < k && y.compareTo(n1) !== 0) {
                        y = y.modPowInt(2, this);
                        if (y.compareTo(BigInteger.ONE) === 0) {
                            return false;
                        }
                    }
                    if (y.compareTo(n1) !== 0) {
                        return false;
                    }
                }
            }
            return true;
        };
        BigInteger.prototype.compareTo = function (a) {
            var r = this.s - a.s;
            if (r !== 0) {
                return r;
            }
            var i = this.t;
            r = i - a.t;
            if (r !== 0) {
                return (this.s < 0) ? -r : r;
            }
            while (--i >= 0) {
                if ((r = this[i] - a[i]) !== 0) {
                    return r;
                }
            }
            return 0;
        };
        BigInteger.prototype.mod = function (a) {
            var r = nbi();
            this.abs().divRemTo(a, null, r);
            if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
                a.subTo(r, r);
            }
            return r;
        };
        BigInteger.prototype.squareTo = function (r) {
            var x = this.abs();
            var i = r.t = 2 * x.t;
            while (--i >= 0) {
                r[i] = 0;
            }
            for (i = 0; i < x.t - 1; ++i) {
                var c = x.am(i, x[i], r, 2 * i, 0, 1);
                if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                    r[i + x.t] -= x.DV;
                    r[i + x.t + 1] = 1;
                }
            }
            if (r.t > 0) {
                r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
            }
            r.s = 0;
            r.clamp();
        };
        BigInteger.prototype.dlShiftTo = function (n, r) {
            var i;
            for (i = this.t - 1; i >= 0; --i) {
                r[i + n] = this[i];
            }
            for (i = n - 1; i >= 0; --i) {
                r[i] = 0;
            }
            r.t = this.t + n;
            r.s = this.s;
        };
        BigInteger.prototype.drShiftTo = function (n, r) {
            for (var i = n; i < this.t; ++i) {
                r[i - n] = this[i];
            }
            r.t = Math.max(this.t - n, 0);
            r.s = this.s;
        };
        BigInteger.prototype.lShiftTo = function (n, r) {
            var bs = n % this.DB;
            var cbs = this.DB - bs;
            var bm = (1 << cbs) - 1;
            var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
            for (i = this.t - 1; i >= 0; --i) {
                r[i + ds + 1] = (this[i] >> cbs) | c;
                c = (this[i] & bm) << bs;
            }
            for (i = ds - 1; i >= 0; --i) {
                r[i] = 0;
            }
            r[ds] = c;
            r.t = this.t + ds + 1;
            r.s = this.s;
            r.clamp();
        };
        BigInteger.prototype.rShiftTo = function (n, r) {
            r.s = this.s;
            var ds = Math.floor(n / this.DB);
            if (ds >= this.t) {
                r.t = 0;
                return;
            }
            var bs = n % this.DB;
            var cbs = this.DB - bs;
            var bm = (1 << bs) - 1;
            r[0] = this[ds] >> bs;
            for (var i = ds + 1; i < this.t; ++i) {
                r[i - ds - 1] |= (this[i] & bm) << cbs;
                r[i - ds] = this[i] >> bs;
            }
            if (bs > 0) {
                r[this.t - ds - 1] |= (this.s & bm) << cbs;
            }
            r.t = this.t - ds;
            r.clamp();
        };
        BigInteger.prototype.subTo = function (a, r) {
            var i = 0, c = 0, m = Math.min(a.t, this.t);
            while (i < m) {
                c += this[i] - a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            if (a.t < this.t) {
                c -= a.s;
                while (i < this.t) {
                    c += this[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c += this.s;
            }
            else {
                c += this.s;
                while (i < a.t) {
                    c -= a[i];
                    r[i++] = c & this.DM;
                    c >>= this.DB;
                }
                c -= a.s;
            }
            r.s = (c < 0) ? -1 : 0;
            if (c < -1) {
                r[i++] = this.DV + c;
            }
            else if (c > 0) {
                r[i++] = c;
            }
            r.t = i;
            r.clamp();
        };
        BigInteger.prototype.multiplyTo = function (a, r) {
            var x = this.abs(), y = a.abs();
            var i = x.t;
            r.t = i + y.t;
            while (--i >= 0) {
                r[i] = 0;
            }
            for (i = 0; i < y.t; ++i) {
                r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
            }
            r.s = 0;
            r.clamp();
            if (this.s !== a.s) {
                BigInteger.ZERO.subTo(r, r);
            }
        };
        BigInteger.prototype.divRemTo = function (m, q, r) {
            var pm = m.abs();
            if (pm.t <= 0) {
                return;
            }
            var pt = this.abs();
            if (pt.t < pm.t) {
                if (q !== null)
                    q.fromInt(0);
                if (r !== null)
                    this.copyTo(r);
                return;
            }
            if (r === null) {
                r = nbi();
            }
            var y = nbi(), ts = this.s, ms = m.s;
            var nsh = this.DB - nbits(pm[pm.t - 1]);
            if (nsh > 0) {
                pm.lShiftTo(nsh, y);
                pt.lShiftTo(nsh, r);
            }
            else {
                pm.copyTo(y);
                pt.copyTo(r);
            }
            var ys = y.t;
            var y0 = y[ys - 1];
            if (y0 === 0) {
                return;
            }
            var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
            var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
            var i = r.t, j = i - ys, t = (q === null) ? nbi() : q;
            y.dlShiftTo(j, t);
            if (r.compareTo(t) >= 0) {
                r[r.t++] = 1;
                r.subTo(t, r);
            }
            BigInteger.ONE.dlShiftTo(ys, t);
            t.subTo(y, y);
            while (y.t < ys) {
                y[y.t++] = 0;
            }
            while (--j >= 0) {
                var qd = (r[--i] === y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
                if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
                    y.dlShiftTo(j, t);
                    r.subTo(t, r);
                    while (r[i] < --qd) {
                        r.subTo(t, r);
                    }
                }
            }
            if (q !== null) {
                r.drShiftTo(ys, q);
                if (ts !== ms) {
                    BigInteger.ZERO.subTo(q, q);
                }
            }
            r.t = ys;
            r.clamp();
            if (nsh > 0) {
                r.rShiftTo(nsh, r);
            }
            if (ts < 0) {
                BigInteger.ZERO.subTo(r, r);
            }
        };
        BigInteger.prototype.invDigit = function () {
            if (this.t < 1) {
                return 0;
            }
            var x = this[0];
            if ((x & 1) === 0) {
                return 0;
            }
            var y = x & 3;
            y = (y * (2 - (x & 0xf) * y)) & 0xf;
            y = (y * (2 - (x & 0xff) * y)) & 0xff;
            y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
            y = (y * (2 - x * y % this.DV)) % this.DV;
            return (y > 0) ? this.DV - y : -y;
        };
        BigInteger.prototype.isEven = function () {
            return ((this.t > 0) ? (this[0] & 1) : this.s) === 0;
        };
        BigInteger.prototype.exp = function (e, z) {
            if (e > 0xffffffff || e < 1) {
                return BigInteger.ONE;
            }
            var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
            g.copyTo(r);
            while (--i >= 0) {
                z.sqrTo(r, r2);
                if ((e & (1 << i)) > 0) {
                    z.mulTo(r2, g, r);
                }
                else {
                    var t = r;
                    r = r2;
                    r2 = t;
                }
            }
            return z.revert(r);
        };
        BigInteger.prototype.modPowInt = function (e, m) {
            var z;
            if (e < 256 || m.isEven()) {
                z = new algorithms_1.Classic(m);
            }
            else {
                z = new algorithms_1.Montgomery(m);
            }
            return this.exp(e, z);
        };
        BigInteger.prototype.toString = function (b) {
            if (this.s < 0) {
                return '-' + this.negate().toString(b);
            }
            var k;
            if (b === 16) {
                k = 4;
            }
            else if (b === 8) {
                k = 3;
            }
            else if (b === 2) {
                k = 1;
            }
            else if (b === 32) {
                k = 5;
            }
            else if (b === 4) {
                k = 2;
            }
            else {
                return this.toRadix(b);
            }
            var km = (1 << k) - 1, d, m = false, r = '', i = this.t;
            var p = this.DB - (i * this.DB) % k;
            if (i-- > 0) {
                if (p < this.DB && (d = this[i] >> p) > 0) {
                    m = true;
                    r = int2char(d);
                }
                while (i >= 0) {
                    if (p < k) {
                        d = (this[i] & ((1 << p) - 1)) << (k - p);
                        d |= this[--i] >> (p += this.DB - k);
                    }
                    else {
                        d = (this[i] >> (p -= k)) & km;
                        if (p <= 0) {
                            p += this.DB;
                            --i;
                        }
                    }
                    if (d > 0) {
                        m = true;
                    }
                    if (m) {
                        r += int2char(d);
                    }
                }
            }
            return m ? r : '0';
        };
        BigInteger.prototype.negate = function () {
            var r = nbi();
            BigInteger.ZERO.subTo(this, r);
            return r;
        };
        BigInteger.prototype.abs = function () {
            return (this.s < 0) ? this.negate() : this;
        };
        BigInteger.prototype.bitLength = function () {
            if (this.t <= 0) {
                return 0;
            }
            return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
        };
        BigInteger.prototype.clone = function () {
            var r = nbi();
            this.copyTo(r);
            return r;
        };
        BigInteger.prototype.intValue = function () {
            if (this.s < 0) {
                if (this.t === 1) {
                    return this[0] - this.DV;
                }
                else if (this.t === 0) {
                    return -1;
                }
            }
            else if (this.t === 1) {
                return this[0];
            }
            else if (this.t === 0) {
                return 0;
            }
            return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
        };
        BigInteger.prototype.byteValue = function () {
            return (this.t === 0) ? this.s : (this[0] << 24) >> 24;
        };
        BigInteger.prototype.shortValue = function () {
            return (this.t === 0) ? this.s : (this[0] << 16) >> 16;
        };
        BigInteger.prototype.sigNum = function () {
            if (this.s < 0) {
                return -1;
            }
            else if (this.t <= 0 || (this.t === 1 && this[0] <= 0)) {
                return 0;
            }
            else {
                return 1;
            }
        };
        BigInteger.prototype.toByteArray = function (signed) {
            var i = this.t, r = [];
            r[0] = this.s;
            var p = this.DB - (i * this.DB) % 8, d, k = 0;
            if (i-- > 0) {
                if (p < this.DB && (d = this[i] >> p) !== (this.s & this.DM) >> p) {
                    r[k++] = d | (this.s << (this.DB - p));
                }
                while (i >= 0) {
                    if (p < 8) {
                        d = (this[i] & ((1 << p) - 1)) << (8 - p);
                        d |= this[--i] >> (p += this.DB - 8);
                    }
                    else {
                        d = (this[i] >> (p -= 8)) & 0xff;
                        if (p <= 0) {
                            p += this.DB;
                            --i;
                        }
                    }
                    if (signed && (d & 0x80) !== 0) {
                        d |= -256;
                    }
                    if (k === 0 && (this.s & 0x80) !== (d & 0x80)) {
                        ++k;
                    }
                    if (k > 0 || d !== this.s) {
                        r[k++] = d;
                    }
                }
            }
            return r;
        };
        BigInteger.prototype.equals = function (a) {
            return (this.compareTo(a) === 0);
        };
        BigInteger.prototype.min = function (a) {
            return (this.compareTo(a) < 0) ? this : a;
        };
        BigInteger.prototype.max = function (a) {
            return (this.compareTo(a) > 0) ? this : a;
        };
        BigInteger.prototype.add = function (a) {
            var r = nbi();
            this.addTo(a, r);
            return r;
        };
        BigInteger.prototype.subtract = function (a) {
            var r = nbi();
            this.subTo(a, r);
            return r;
        };
        BigInteger.prototype.multiply = function (a) {
            var r = nbi();
            this.multiplyTo(a, r);
            return r;
        };
        BigInteger.prototype.square = function () {
            var r = nbi();
            this.squareTo(r);
            return r;
        };
        BigInteger.prototype.divide = function (a) {
            var r = nbi();
            this.divRemTo(a, r, null);
            return r;
        };
        BigInteger.prototype.remainder = function (a) {
            var r = nbi();
            this.divRemTo(a, null, r);
            return r;
        };
        BigInteger.prototype.divideAndRemainder = function (a) {
            var q = nbi(), r = nbi();
            this.divRemTo(a, q, r);
            return [q, r];
        };
        BigInteger.prototype.pow = function (e) {
            return this.exp(e, new algorithms_1.NullExp());
        };
        BigInteger.prototype.modPow = function (e, m) {
            var i = e.bitLength(), k, r = nbv(1), z;
            if (i <= 0) {
                return r;
            }
            else if (i < 18) {
                k = 1;
            }
            else if (i < 48) {
                k = 3;
            }
            else if (i < 144) {
                k = 4;
            }
            else if (i < 768) {
                k = 5;
            }
            else {
                k = 6;
            }
            if (i < 8)
                z = new algorithms_1.Classic(m);
            else if (m.isEven())
                z = new algorithms_1.Barrett(m);
            else
                z = new algorithms_1.Montgomery(m);
            var g = [], n = 3, k1 = k - 1, km = (1 << k) - 1;
            g[1] = z.convert(this);
            if (k > 1) {
                var g2 = nbi();
                z.sqrTo(g[1], g2);
                while (n <= km) {
                    g[n] = nbi();
                    z.mulTo(g2, g[n - 2], g[n]);
                    n += 2;
                }
            }
            var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
            i = nbits(e[j]) - 1;
            while (j >= 0) {
                if (i >= k1) {
                    w = (e[j] >> (i - k1)) & km;
                }
                else {
                    w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
                    if (j > 0) {
                        w |= e[j - 1] >> (this.DB + i - k1);
                    }
                }
                n = k;
                while ((w & 1) === 0) {
                    w >>= 1;
                    --n;
                }
                if ((i -= n) < 0) {
                    i += this.DB;
                    --j;
                }
                if (is1) {
                    g[w].copyTo(r);
                    is1 = false;
                }
                else {
                    while (n > 1) {
                        z.sqrTo(r, r2);
                        z.sqrTo(r2, r);
                        n -= 2;
                    }
                    if (n > 0) {
                        z.sqrTo(r, r2);
                    }
                    else {
                        t = r;
                        r = r2;
                        r2 = t;
                    }
                    z.mulTo(r2, g[w], r);
                }
                while (j >= 0 && (e[j] & (1 << i)) === 0) {
                    z.sqrTo(r, r2);
                    t = r;
                    r = r2;
                    r2 = t;
                    if (--i < 0) {
                        i = this.DB - 1;
                        --j;
                    }
                }
            }
            return z.revert(r);
        };
        BigInteger.prototype.GCD = function (a) {
            var x = (this.s < 0) ? this.negate() : this.clone();
            var y = (a.s < 0) ? a.negate() : a.clone();
            if (x.compareTo(y) < 0) {
                var t = x;
                x = y;
                y = t;
            }
            var i = x.getLowestSetBit(), g = y.getLowestSetBit();
            if (g < 0) {
                return x;
            }
            if (i < g) {
                g = i;
            }
            if (g > 0) {
                x.rShiftTo(g, x);
                y.rShiftTo(g, y);
            }
            while (x.sigNum() > 0) {
                if ((i = x.getLowestSetBit()) > 0) {
                    x.rShiftTo(i, x);
                }
                if ((i = y.getLowestSetBit()) > 0) {
                    y.rShiftTo(i, y);
                }
                if (x.compareTo(y) >= 0) {
                    x.subTo(y, x);
                    x.rShiftTo(1, x);
                }
                else {
                    y.subTo(x, y);
                    y.rShiftTo(1, y);
                }
            }
            if (g > 0) {
                y.lShiftTo(g, y);
            }
            return y;
        };
        BigInteger.prototype.modInverse = function (m) {
            var ac = m.isEven();
            if ((this.isEven() && ac) || m.sigNum() === 0) {
                return BigInteger.ZERO;
            }
            var u = m.clone(), v = this.clone();
            var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
            while (u.sigNum() !== 0) {
                while (u.isEven()) {
                    u.rShiftTo(1, u);
                    if (ac) {
                        if (!a.isEven() || !b.isEven()) {
                            a.addTo(this, a);
                            b.subTo(m, b);
                        }
                        a.rShiftTo(1, a);
                    }
                    else if (!b.isEven()) {
                        b.subTo(m, b);
                    }
                    b.rShiftTo(1, b);
                }
                while (v.isEven()) {
                    v.rShiftTo(1, v);
                    if (ac) {
                        if (!c.isEven() || !d.isEven()) {
                            c.addTo(this, c);
                            d.subTo(m, d);
                        }
                        c.rShiftTo(1, c);
                    }
                    else if (!d.isEven()) {
                        d.subTo(m, d);
                    }
                    d.rShiftTo(1, d);
                }
                if (u.compareTo(v) >= 0) {
                    u.subTo(v, u);
                    if (ac) {
                        a.subTo(c, a);
                    }
                    b.subTo(d, b);
                }
                else {
                    v.subTo(u, v);
                    if (ac) {
                        c.subTo(a, c);
                    }
                    d.subTo(b, d);
                }
            }
            if (v.compareTo(BigInteger.ONE) !== 0) {
                return BigInteger.ZERO;
            }
            if (d.compareTo(m) >= 0) {
                return d.subtract(m);
            }
            if (d.sigNum() < 0) {
                d.addTo(m, d);
            }
            else {
                return d;
            }
            if (d.sigNum() < 0) {
                return d.add(m);
            }
            else {
                return d;
            }
        };
        BigInteger.prototype.isProbablePrime = function (t) {
            var i, x = this.abs();
            if (x.t === 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
                for (i = 0; i < lowprimes.length; ++i)
                    if (x[0] === lowprimes[i]) {
                        return true;
                    }
                return false;
            }
            if (x.isEven()) {
                return false;
            }
            i = 1;
            while (i < lowprimes.length) {
                var m = lowprimes[i], j = i + 1;
                while (j < lowprimes.length && m < lplim) {
                    m *= lowprimes[j++];
                }
                m = x.modInt(m);
                while (i < j) {
                    if (m % lowprimes[i++] === 0) {
                        return false;
                    }
                }
            }
            return x.millerRabin(t);
        };
        BigInteger.prototype.and = function (a) {
            var r = nbi();
            this.bitwiseTo(a, BitOps.and, r);
            return r;
        };
        BigInteger.prototype.or = function (a) {
            var r = nbi();
            this.bitwiseTo(a, BitOps.or, r);
            return r;
        };
        BigInteger.prototype.xor = function (a) {
            var r = nbi();
            this.bitwiseTo(a, BitOps.xor, r);
            return r;
        };
        BigInteger.prototype.andNot = function (a) {
            var r = nbi();
            this.bitwiseTo(a, BitOps.andNot, r);
            return r;
        };
        BigInteger.prototype.not = function () {
            var r = nbi();
            for (var i = 0; i < this.t; ++i) {
                r[i] = this.DM & ~this[i];
            }
            r.t = this.t;
            r.s = ~this.s;
            return r;
        };
        BigInteger.prototype.shiftLeft = function (n) {
            var r = nbi();
            if (n < 0) {
                this.rShiftTo(-n, r);
            }
            else {
                this.lShiftTo(n, r);
            }
            return r;
        };
        BigInteger.prototype.shiftRight = function (n) {
            var r = nbi();
            if (n < 0) {
                this.lShiftTo(-n, r);
            }
            else {
                this.rShiftTo(n, r);
            }
            return r;
        };
        BigInteger.prototype.getLowestSetBit = function () {
            for (var i = 0; i < this.t; ++i) {
                if (this[i] !== 0) {
                    return i * this.DB + lbit(this[i]);
                }
            }
            if (this.s < 0) {
                return this.t * this.DB;
            }
            return -1;
        };
        BigInteger.prototype.bitCount = function () {
            var r = 0, x = this.s & this.DM;
            for (var i = 0; i < this.t; ++i) {
                r += cbit(this[i] ^ x);
            }
            return r;
        };
        BigInteger.prototype.testBit = function (n) {
            var j = Math.floor(n / this.DB);
            if (j >= this.t) {
                return (this.s !== 0);
            }
            return ((this[j] & (1 << (n % this.DB))) !== 0);
        };
        BigInteger.prototype.setBit = function (n) {
            return this.changeBit(n, BitOps.or);
        };
        BigInteger.prototype.clearBit = function (n) {
            return this.changeBit(n, BitOps.andNot);
        };
        BigInteger.prototype.flipBit = function (n) {
            return this.changeBit(n, BitOps.xor);
        };
        return BigInteger;
    }());
    exports.default = BigInteger;
});
//# sourceMappingURL=big-integer.js.map