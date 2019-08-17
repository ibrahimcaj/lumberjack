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

const Inventory = require("./Inventory.js");
const Item = require("./item/Item.js");
const Axe = require("./item/axe/Axe.js");
const {WoodLog} = require("./item/CommonItems.js");
const {Stick} = require("./item/axe/CommonAxes.js");
const {
    t,
    pt,
    unwrap
} = require("../utility/Type.js");
const random = require("random-value-generator");

class User {

    constructor(id, money, inventoryJson) {

        id = unwrap(id);
        money = unwrap(money);
        inventoryJson = unwrap(inventoryJson);
        if (!(t(id, "string") && (money == null || t(money, "number")) && (inventoryJson == null || t(inventoryJson, "string")))) {
            throw new TypeError("Incorrect type(s) for User arguments!");
        }

        if (money != null && !Number.isInteger(money)) {
            throw new RangeError("money must be an integer!");
        }

        this.id = id;
        this.money = money == null ? 0 : money;
        this.inventory = new Inventory(id, inventoryJson);

        if (inventoryJson == null) {
            this.inventory.add(new Stick());
        }
    }

    buy(Type, amount) {

        amount = unwrap(amount);
        if (!(pt(Type, Item) && (amount == null || t(amount, "number")))) {
            throw new TypeError("Incorrect type(s) for buy arguments!");
        }

        if (amount != null && !(Number.isInteger(amount) && amount > 0)) {
            throw new RangeError("amount must be a positive integer!");
        }

        if (amount == null) {
            amount = 1;
        }

        const totalCost = Item.sGetItemDetails(Type).price * amount;
        if (this.money < totalCost) {
            return -1;
        }

        this.inventory.addByType(Type, amount);
        this.money -= totalCost;
        return totalCost;
    }

    sell(Type, amount) {

        amount = unwrap(amount);
        if (!(pt(Type, Item) && (amount == null || t(amount, "number")))) {
            throw new TypeError("Incorrect type(s) for sell arguments!");
        }

        if (amount != null && !(Number.isInteger(amount) && amount > 0)) {
            throw new TypeError("amount must be a positive integer!");
        }

        if (amount == null) {
            amount = 1;
        }
        if (this.inventory.count(Type) < amount) {
            return -1;
        }

        const details = Item.sGetItemDetails(Type);
        const price = details.price;
        let averageDurability = details.durability;
        if (averageDurability !== undefined) {
            const value1 = averageDurability.value1;
            const value2 = averageDurability.value2;
            averageDurability = value2 === undefined ? value1 : ((value1 + value2) / 2);
        }

        let addition = 0;
        if (pt(Type, Axe)) {

            while (amount--) {
                const item = this.inventory.getBestAxe(Type);
                addition += Math.floor(item.durability.value / averageDurability * price / 2);
                this.inventory.delete(item);
            }
        } else {
            this.inventory.deleteByType(Type, amount);
            addition += price * amount;
        }

        this.money += addition;
        return addition;
    }

    cut(axe, value1, value2) {

        value1 = unwrap(value1);
        value2 = unwrap(value2);
        if (!(t(axe, Axe) && t(value1, "number") && t(value2, "number"))) {
            throw new TypeError("Incorrect type(s) for cut arguments!");
        }

        if (!(Number.isInteger(value1) && value1 > 0)) {
            throw new RangeError("value1 must be a positive integer!");
        }

        if (!(Number.isInteger(value2) && value2 > 0)) {
            throw new RangeError("value2 must be a positive integer!");
        }

        if (!this.inventory.has(axe)) {
            throw new Error("Only axes from user inventory can be used");
        }

        if (axe.isBroken()) {
            throw new Error("The provided axe is broken!");
        }

        if (axe.cut().isBroken()) {
            this.inventory.delete(axe);
        }

        let number = 0;
        if (random.randomNumber() > (1 / 150)) {
            const min = Math.min(value1, value2);
            number = min + random.randomInteger(Math.max(value1, value2) - min);
            this.inventory.addByType(WoodLog, number);
        } else {
            this.inventory.clear();
            this.money = 0;
        }
        return number;
    }

    /**
     * @override
     */
    toString() {
        return super.toString().replace(/Object/g, this.constructor.name);
    }
}

module.exports = User;
