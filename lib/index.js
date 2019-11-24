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
        define(["require", "exports", "./secure-random", "./algorithms", "./big-integer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var secure_random_1 = require("./secure-random");
    exports.SecureRandom = secure_random_1.default;
    exports.Arcfour = secure_random_1.Arcfour;
    exports.rng_seed_time = secure_random_1.rng_seed_time;
    var algorithms_1 = require("./algorithms");
    exports.Classic = algorithms_1.Classic;
    exports.Barrett = algorithms_1.Barrett;
    exports.Montgomery = algorithms_1.Montgomery;
    exports.NullExp = algorithms_1.NullExp;
    var big_integer_1 = require("./big-integer");
    exports.BigInteger = big_integer_1.default;
});
//# sourceMappingURL=index.js.map