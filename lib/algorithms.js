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
        define(["require", "exports", "./big-integer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var big_integer_1 = require("./big-integer");
    var Classic = (function () {
        function Classic(m) {
            this.m = m;
        }
        Classic.prototype.convert = function (x) {
            if (x.s < 0 || x.compareTo(this.m) >= 0) {
                return x.mod(this.m);
            }
            return x;
        };
        Classic.prototype.revert = function (x) {
            return x;
        };
        Classic.prototype.reduce = function (x) {
            x.divRemTo(this.m, null, x);
        };
        Classic.prototype.mulTo = function (x, y, r) {
            x.multiplyTo(y, r);
            this.reduce(r);
        };
        Classic.prototype.sqrTo = function (x, r) {
            x.squareTo(r);
            this.reduce(r);
        };
        return Classic;
    }());
    exports.Classic = Classic;
    var Barrett = (function () {
        function Barrett(m) {
            this.r2 = new big_integer_1.default(null);
            this.q3 = new big_integer_1.default(null);
            big_integer_1.default.ONE.dlShiftTo(2 * m.t, this.r2);
            this.mu = this.r2.divide(m);
            this.m = m;
        }
        Barrett.prototype.convert = function (x) {
            if (x.s < 0 || x.t > 2 * this.m.t) {
                return x.mod(this.m);
            }
            else if (x.compareTo(this.m) < 0) {
                return x;
            }
            else {
                var r = new big_integer_1.default(null);
                x.copyTo(r);
                this.reduce(r);
                return r;
            }
        };
        Barrett.prototype.revert = function (x) {
            return x;
        };
        Barrett.prototype.reduce = function (x) {
            x.drShiftTo(this.m.t - 1, this.r2);
            if (x.t > this.m.t + 1) {
                x.t = this.m.t + 1;
                x.clamp();
            }
            this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
            this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
            while (x.compareTo(this.r2) < 0) {
                x.dAddOffset(1, this.m.t + 1);
            }
            x.subTo(this.r2, x);
            while (x.compareTo(this.m) >= 0) {
                x.subTo(this.m, x);
            }
        };
        Barrett.prototype.sqrTo = function (x, r) {
            x.squareTo(r);
            this.reduce(r);
        };
        Barrett.prototype.mulTo = function (x, y, r) {
            x.multiplyTo(y, r);
            this.reduce(r);
        };
        return Barrett;
    }());
    exports.Barrett = Barrett;
    var Montgomery = (function () {
        function Montgomery(m) {
            this.m = m;
            this.mp = m.invDigit();
            this.mpl = this.mp & 0x7fff;
            this.mph = this.mp >> 15;
            this.um = (1 << (m.DB - 15)) - 1;
            this.mt2 = 2 * m.t;
        }
        Montgomery.prototype.convert = function (x) {
            var r = new big_integer_1.default(null);
            x.abs().dlShiftTo(this.m.t, r);
            r.divRemTo(this.m, null, r);
            if (x.s < 0 && r.compareTo(big_integer_1.default.ZERO) > 0) {
                this.m.subTo(r, r);
            }
            return r;
        };
        Montgomery.prototype.revert = function (x) {
            var r = new big_integer_1.default(null);
            x.copyTo(r);
            this.reduce(r);
            return r;
        };
        Montgomery.prototype.reduce = function (x) {
            while (x.t <= this.mt2) {
                x[x.t++] = 0;
            }
            for (var i = 0; i < this.m.t; ++i) {
                var j = x[i] & 0x7fff;
                var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
                j = i + this.m.t;
                x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
                while (x[j] >= x.DV) {
                    x[j] -= x.DV;
                    x[++j]++;
                }
            }
            x.clamp();
            x.drShiftTo(this.m.t, x);
            if (x.compareTo(this.m) >= 0) {
                x.subTo(this.m, x);
            }
        };
        Montgomery.prototype.sqrTo = function (x, r) {
            x.squareTo(r);
            this.reduce(r);
        };
        Montgomery.prototype.mulTo = function (x, y, r) {
            x.multiplyTo(y, r);
            this.reduce(r);
        };
        return Montgomery;
    }());
    exports.Montgomery = Montgomery;
    var NullExp = (function () {
        function NullExp() {
        }
        NullExp.prototype.convert = function (x) {
            return x;
        };
        NullExp.prototype.revert = function (x) {
            return x;
        };
        NullExp.prototype.mulTo = function (x, y, r) {
            x.multiplyTo(y, r);
        };
        NullExp.prototype.sqrTo = function (x, r) {
            x.squareTo(r);
        };
        NullExp.prototype.reduce = function (x) {
        };
        return NullExp;
    }());
    exports.NullExp = NullExp;
});
//# sourceMappingURL=algorithms.js.map