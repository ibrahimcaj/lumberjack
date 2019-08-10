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
} = require("../../../utility/Type.js");
const {randomInteger} = require("random-value-generator");

class Durability {

    constructor(value1, value2) {

        value1 = unwrap(value1);
        value2 = unwrap(value2);
        if (!(t(value1, "number") && (value2 == null || t(value2, "number")))) {
            throw new TypeError("Incorrect type(s) for Durability arguments!");
        }

        if (!(Number.isInteger(value1) && value1 > 0)) {
            throw new RangeError("value1 must be a positive integer!");
        }

        if (value2 != null && !(Number.isInteger(value2) && value2 > 0)) {
            throw new TypeError("value2 must be a positive integer!");
        }

        if (value2 == null) {
            this.value = value1;
        } else {
            const min = Math.min(value1, value2);
            this.value = min + randomInteger(Math.max(value1, value2) - min + 1);
        }
    }

    decrease() {

        if (this.value <= 0) {
            throw new Error("Durability can't decrement past 0");
        }

        this.value--;
        return this;
    }

    toJSON(key) {
        return key === "" ? {durability: this.value} : this.value;
    }

    /**
     * @override
     */
    toString() {
        return this.value.toString();
    }

    /**
     * @override
     */
    valueOf() {
        return this.value;
    }
}

module.exports = Durability;
