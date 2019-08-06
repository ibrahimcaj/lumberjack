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

const {isClass} = require("../../utility/Type.js");
const itemDatas = require("./items.json");

/**
 * @abstract
 */
class Item {

    constructor() {

        this.name = this.constructor.name;
        if (this.isAbstract()) {
            throw new TypeError(`${this.name} class is abstract`);
        }
    }

    getItemDetails() {
        return Item.sGetItemDetails(this.constructor);
    }

    static sGetItemDetails(Type) {

        if (!isClass(Type)) {
            throw new TypeError("Incorrect type for sGetItemDetails argument!");
        }

        const filtered = Object.values(itemDatas).filter(itemData => itemData.name === Type.name);
        if (filtered.length !== 1) {
            throw new Error("Invalid type or invalid items.json");
        }

        const itemData = filtered[0];
        if (!itemData.friendlyName) {
            itemData.friendlyName = itemData.name;
        }
        return itemData;
    }

    isValid() {

        try {
            this.getItemDetails();
            return true;
        } catch (error) {
            return false;
        }
    }

    toJSON() {
        return {name: this.name};
    }

    /**
     * @override
     */
    toString() {
        return super.toString().replace(/Object/g, this.name);
    }

    isAbstract() {
        return this.constructor === Item;
    }
}

module.exports = Item;
