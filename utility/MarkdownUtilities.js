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
} = require("./Type.js");

function bold(object) {

    const character = "*";
    const wrap = character.repeat(2);
    return `${wrap}${object.toString().replace(new RegExp(`\\${character}`, "gi"), `\\${character}`)}${wrap}`;
}

function code(object) {

    const character = "`";
    return `${character}${object.toString().replace(new RegExp(character, "gi"), `\\${character}`)}${character}`;
}

function codeBlock(object, language) {

    language = unwrap(language);
    if (!(language == null || t(language, "string"))) {
        throw new TypeError("Incorrect type for codeBlock arguments!");
    }

    const character = "`";
    const wrap = character.repeat(3);

    const replaced = object.toString().replace(new RegExp(character, "g"), `${character}\u200b`);
    return `${wrap}${language ? language : ""}\n${replaced.length ? replaced : " "}${wrap}`;
}

module.exports = {
    bold,
    code,
    codeBlock
};
