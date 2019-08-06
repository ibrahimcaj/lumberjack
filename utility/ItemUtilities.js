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

const {sGetItemDetails} = require("../game/item/Item.js");
const CommonItems = require("../game/item/CommonItems.js");
const CommonAxes = require("../game/item/axe/CommonAxes.js");

const {
    t,
    unwrap
} = require("./Type.js");

function getAllTypes() {
    return Object.assign(Object.assign({}, CommonItems), CommonAxes);
}

function findItem(args) {

    if (!Array.isArray(args)) {
        throw new TypeError("Incorrect type for findItem argument!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for findItem argument!");
    }

    const filtereds = [];
    Object.values(getAllTypes()).forEach(Type => {

        const itemData = sGetItemDetails(Type);
        const nameParts = itemData.friendlyName.split(/\s+/g);
        const minimumLength = nameParts.length;
        if (args.length < minimumLength) {
            return;
        }

        let matched = true;
        for (let i = 0; i < minimumLength; i++) {
            if (args[i].toLowerCase() !== nameParts[i].toLowerCase()) {
                matched = false;
                break;
            }
        }

        if (matched) {
            filtereds.push(itemData);
        }
    });

    return filtereds.sort((a, b) => b.friendlyName.length - a.friendlyName.length)[0];
}

module.exports = {
    getAllTypes,
    findItem
};
