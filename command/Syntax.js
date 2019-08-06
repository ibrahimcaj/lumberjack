/**
 * @license
 * Copyright (c) 2019 vanished
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

const {
    t,
    unwrap
} = require("../utility/Type.js");

class Syntax {

    constructor() {
        this.string = "";
    }

    plain(object) {

        if (object == null) {
            throw new TypeError("Incorrect type for plain argument!");
        }

        this.string += ` ${object}`;
        return this;
    }

    required(object) {

        if (object == null) {
            throw new TypeError("Incorrect type for required argument!");
        }

        this.string += ` <${object}>`;
        return this;
    }

    optional(object) {

        if (object == null) {
            throw new TypeError("Incorrect type for optional argument!");
        }

        this.string += ` [${object}]`;
        return this;
    }

    or(object1, object2) {

        if (object1 == null || object2 == null) {
            throw new TypeError("Incorrect type(s) for plain arguments!");
        }

        this.string += ` (${object1}|${object2})`
        return this;
    }

    /**
     * @override
     */
    toString(shouldTrim) {

        shouldTrim = unwrap(shouldTrim);
        if (!(shouldTrim == null || t(shouldTrim, "boolean"))) {
            throw new TypeError("Incorrect type for toString argument!");
        }

        return shouldTrim ? this.string.trim() : this.string;
    }
}

module.exports = Syntax;
