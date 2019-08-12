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

// t relies on:
// isClass
// (isUpperCase)
// unwrap
function t(object, type) {

    type = unwrap(type);
    const typeIsString = typeof type === "string";
    if (!(typeIsString || isClass(type))) {
        throw new TypeError("Incorrect type for t arguments!");
    }

    // t(null, "null")
    if (object === null) {
        return type === "null";
    }

    // t(true, "boolean")
    if (typeIsString) {
        return typeof object === type;
    }

    // class A {}
    // class B extends A {}
    // t(new B(), A)
    return object instanceof type;
}

// pt relies on:
// isClass
// (isUpperCase)
// (unwrap)
// t
function pt(object, type) {

    if (!(isClass(object) && isClass(type))) {
        throw new TypeError("Incorrect type(s) for pt arguments!");
    }

    // class A {}
    // class B extends A {}
    // t(B, A)
    return object === type || t(object.prototype, type);
}

// isClass relies on:
// isUpperCase
// (unwrap)
function isClass(object) {

    if (typeof object !== "function") {
        return false;
    }

    const string = object.toString();
    const name = object.name;
    return string.startsWith("class ") ||
        (string.startsWith("function ") && name != null && isUpperCase(name.charAt(0)));
}

// isFunction relies on:
// t
// (isClass)
// (isUpperCase)
// (unwrap)
function isFunction(object) {

    return t(object, "function") &&
        /^((function(\s+.*\s*)*\(.*\).*)|(((\(.*\))|(\S+))\s*\=\>.*))/.test(object.toString());
}

// isUpperCase relies on:
// unwrap
function isUpperCase(string) {

    string = unwrap(string);
    if (typeof string !== "string") {
        throw new TypeError("Incorrect type for isUpperCase argument!");
    }

    return string.length && string.split("").every(character => character.toUpperCase() === character);
}

function unwrap(object) {
    return [Boolean, Number, String, Symbol].some(Wrapper => object instanceof Wrapper) ? object.valueOf() : object;
}

module.exports = {
    t,
    pt,
    isClass,
    isFunction,
    unwrap
};
