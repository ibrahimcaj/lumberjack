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

const Item = require("./item/Item.js");
const Axe = require("./item/axe/Axe.js");
const {getAllTypes} = require("../utility/ItemUtilities.js");
const InventoryCorruptedError = require("./InventoryCorruptedError.js");
const {
    t,
    pt,
    isFunction,
    unwrap
} = require("../utility/Type.js");

class Inventory extends Set {

    constructor(id, json) {

        id = unwrap(id);
        json = unwrap(json);
        if (!(t(id, "string") && (json == null || t(json, "string")))) {
            throw new TypeError("Incorrect type for Inventory argument!");
        }

        super();
        this.id = id;

        if (json != null) {
            try {
                JSON.parse(json).forEach(object => this.add(new (getAllTypes()[object.name])(object)));

            } catch (error) {
                const message = error.message;
                throw (t(error, SyntaxError) || message.includes("is not a constructor")) ?
                    new InventoryCorruptedError(id) : error;
            }
        }
    }

    /**
     * @override
     */
    add(item) {

        if (!t(item, Item)) {
            throw new TypeError("Incorrect type for add argument!");
        }

        return super.add(item);
    }

    addByType(Type, amount, ...parameters) {

        amount = unwrap(amount);
        if (!(pt(Type, Item) && t(amount, "number"))) {
            throw new TypeError("Incorrect type(s) for addByType arguments!");
        }

        if (!(Number.isInteger(amount) && amount > 0)) {
            throw new RangeError("amount must be a positive integer!");
        }

        for (let i = 0; i < amount; i++) {
            this.add(new Type(...parameters));
        }
        return amount;
    }

    deleteByType(Type, amount, sortFunction) {

        amount = unwrap(amount);
        if (!(pt(Type, Item) && t(amount, "number") && (sortFunction == null || isFunction(sortFunction)))) {
            throw new TypeError("Incorrect type(s) for deleteByType arguments!");
        }

        if (!(Number.isInteger(amount) && amount > 0)) {
            throw new RangeError("amount must be a positive integer!");
        }

        const array = Array.from(this);
        const filtered = array.filter(item => t(item, Type));
        if (filtered.length < amount) {
            return -1;
        }

        if (sortFunction != null) {
            filtered.sort((first, second) => sortFunction(first, second, Object.assign([], filtered), Object.assign([], array)));
        }

        for (let i = 0; i < amount; i++) {
            this.delete(filtered[i]);
        }
        return amount;
    }

    getBestAxe(Type) {

        if (!(Type == null || pt(Type, Axe))) {
            throw new TypeError("Incorrect type for getBestAxe argument!");
        }

        if (Type == null) {
            Type = Axe;
        }

        return Array.from(this).filter(item => t(item, Type) && item.durability.value > 0)
            .sort((a, b) => b.price - a.price)
            .filter((item, index, sorted) => item.price === sorted[0].price)
            .sort((a, b) => b.durability.value - a.durability.value)[0];
    }

    count(Type) {

        if (!pt(Type, Item)) {
            throw new TypeError("Incorrect type for count argument!");
        }

        return Array.from(this).filter(item => t(item, Type) && item.isValid())
            .filter(item => t(item, Axe) ? !item.isBroken() : true).length;
    }

    toJSON() {
        return Array.from(this);
    }

    /**
     * @override
     */
    toString() {
        return super.toString().replace(/Object/g, this.constructor.name);
    }
}

module.exports = Inventory;
