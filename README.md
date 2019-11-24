![npm](https://img.shields.io/npm/v/@modern-dev/jsbn)
![NPM](https://img.shields.io/npm/l/@modern-dev/jsbn)

Tom Wu's `jsbn` library in TypeScript
===================================

The `jsbn` library is a pure JavaScript implementation of arbitrary-precision
integer arithmetic.

Installation
------------

```shell script
$ npm install --save @modern-dev/jsbn
```

Usage
-----

```js
import { BigInteger } from '@modern-dev/jsbn';

const bi = new BigInteger('91823918239182398123');
console.log(bi.bitLength()); // 67
```

Similar projects
----------------
https://github.com/akalin/jsbn

https://github.com/creationix/jsbn

https://github.com/andyperlitch/jsbn

Licensing
---------

`jsbn` is released under a BSD license.
See [`LICENSE`](LICENSE) for details.

[Tom Wu](mailto:tjw@cs.stanford.edu)
