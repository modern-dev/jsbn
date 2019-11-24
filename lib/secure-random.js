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
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var rng_state = null;
    var rng_pool;
    var rng_pptr = 0;
    var rng_psize = 256;
    if (typeof rng_pool === 'undefined') {
        rng_pool = [];
        var t = void 0;
        if (typeof window !== 'undefined' && window.crypto) {
            if (window.crypto.getRandomValues) {
                var ua = new Uint8Array(32);
                window.crypto.getRandomValues(ua);
                for (t = 0; t < 32; ++t) {
                    rng_pool[rng_pptr++] = ua[t];
                }
            }
            else if (navigator.appName === 'Netscape' && navigator.appVersion < '5') {
                var z = window.crypto.random(32);
                for (t = 0; t < z.length; ++t)
                    rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
            }
        }
        while (rng_pptr < rng_psize) {
            t = Math.floor(65536 * Math.random());
            rng_pool[rng_pptr++] = t >>> 8;
            rng_pool[rng_pptr++] = t & 255;
        }
        rng_pptr = 0;
        rng_seed_time();
    }
    function rng_seed_int(x) {
        rng_pool[rng_pptr++] ^= x & 255;
        rng_pool[rng_pptr++] ^= (x >> 8) & 255;
        rng_pool[rng_pptr++] ^= (x >> 16) & 255;
        rng_pool[rng_pptr++] ^= (x >> 24) & 255;
        if (rng_pptr >= rng_psize) {
            rng_pptr -= rng_psize;
        }
    }
    function rng_get_byte() {
        if (rng_state === null) {
            rng_seed_time();
            rng_state = prng_newstate();
            rng_state.init(rng_pool);
            for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) {
                rng_pool[rng_pptr] = 0;
            }
            rng_pptr = 0;
        }
        return rng_state.next();
    }
    function rng_get_bytes(ba) {
        var i;
        for (i = 0; i < ba.length; ++i) {
            ba[i] = rng_get_byte();
        }
    }
    function prng_newstate() {
        return new Arcfour();
    }
    function rng_seed_time() {
        rng_seed_int(new Date().getTime());
    }
    exports.rng_seed_time = rng_seed_time;
    var SecureRandom = (function () {
        function SecureRandom() {
            this.nextBytes = rng_get_bytes;
        }
        return SecureRandom;
    }());
    exports.default = SecureRandom;
    var Arcfour = (function () {
        function Arcfour() {
            this.i = 0;
            this.j = 0;
            this.S = [];
        }
        Arcfour.prototype.init = function (key) {
            var i, j, t;
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
        };
        Arcfour.prototype.next = function () {
            var t;
            this.i = (this.i + 1) & 255;
            this.j = (this.j + this.S[this.i]) & 255;
            t = this.S[this.i];
            this.S[this.i] = this.S[this.j];
            this.S[this.j] = t;
            return this.S[(t + this.S[this.i]) & 255];
        };
        return Arcfour;
    }());
    exports.Arcfour = Arcfour;
});
//# sourceMappingURL=secure-random.js.map