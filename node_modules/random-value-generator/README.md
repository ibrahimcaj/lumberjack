# [random-value-generator][NPM Package]

## Badges

[![Join Discord to chat!](https://img.shields.io/discord/519513445721178133.svg?longCache=true&style=flat-square&logo=discord&color=7289da)](https://discord.gg/QgxZuHk) [![MIT License](https://img.shields.io/badge/license-MIT-0366d6.svg?longCache=true&style=flat-square)](/LICENSE) [![View package on npm](https://img.shields.io/npm/v/random-value-generator.svg?longCache=true&style=flat-square&logo=npm&color=cb3837)][NPM Package] [![Download package with npm](https://img.shields.io/npm/dt/random-value-generator.svg?longCache=true&style=flat-square&logo=npm&color=cb3837)][NPM Package] [![Node.js compatibility](https://img.shields.io/node/v/random-value-generator.svg?longCache=true&style=flat-square&logo=node.js&color=026e00)](https://nodejs.org/) [![View build on Travis](https://img.shields.io/travis/com/vanishedvan/random-value-generator.svg?longCache=true&style=flat-square&logo=travis)](https://travis-ci.com/vanishedvan/random-value-generator) [![Star project on GitHub](https://img.shields.io/github/stars/vanishedvan/random-value-generator.svg?longCache=true&style=social)](https://github.com/vanishedvan/random-value-generator)

[![random-value-generator](https://nodei.co/npm/random-value-generator.png?downloads=true&downloadRank=true&stars=true)][NPM Package]

## Introduction

A simple, zero-dependency package that can generate random\* values.

\*: This package does NOT provide cryptographically secure random value generation!

## List of functions

```
- randomNumber(max);
- randomInteger(max);
- randomBoolean();
- randomString(len);
- randomHash(len);
- randomEmoji();
```

Please note that `max` is the maximum value of the returned number, and `len` is the length of the returned string. Both kinds of parameters **MUST** be numbers.

## For the Web

[UNPKG](https://unpkg.com/) can be used as CDN to deliver the script.

Loading the script:
```
<script src="http://unpkg.com/random-value-generator/index.js"></script>
```

Alternatively, script utilizing ES Module can be used:
```
<script type="module" src="http://unpkg.com/random-value-generator/index.mjs"></script>
```

## Installation

Install the module with your terminal/console using:
```
npm i random-value-generator
```

Defining the module in your code:

* CommonJS:
  ```
  const random = require("random-value-generator");
  ```
* ES:
  ```
  import random from "random-value-generator/index.mjs";
  ```

## Examples

[Try the online demo](https://lightwayup.github.io/random-value-generator/).

```
/**
 * Logs a random number.
 */
console.log(random.randomNumber(max));

/**
 * Logs a random integer.
 */
console.log(random.randomInteger(max));

/**
 * Logs a random boolean. - true or false
 */
console.log(random.randomBoolean());

/**
 * Logs a random string consisting alphanumeric and special characters.
 */
console.log(random.randomString(len));

/**
 * Logs a random string consisting alphanumeric characters.
 */
console.log(random.randomHash(len));

/**
 * Logs a random emoji.
 */
console.log(random.randomEmoji());
```

## API Documentations

[View API documentations](/API_DOCS.md).

## Changelog

[View changelog](/CHANGELOG.md).

## Building from Source

[View build instructions](/BUILD_INSTRUCTIONS.md).

## Links

NPM: https://www.npmjs.com/package/random-value-generator  
Discord: https://discord.gg/QgxZuHk

## License

This project is licensed under [MIT License](/LICENSE).

> Copyright (c) 2019 vanished
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

[NPM Package]: https://www.npmjs.com/package/random-value-generator
