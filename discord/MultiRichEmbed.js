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

const Discord = require("discord.js");
const {
    t,
    isFunction
} = require("../utility/Type.js");
const privateValidator = Symbol();

class MultiRichEmbed extends Discord.RichEmbed {

    constructor(data) {

        if (!(data == null || t(data, "object"))) {
            throw new TypeError("Incorrect type for MultiRichEmbed argument!");
        }

        super(data);
        this.embeds = [];
    }

    /**
     * @override
     */
    addBlankField(inline) {
        return this.add(() => super.addBlankField(inline), privateValidator);
    }

    /**
     * @override
     */
    addField(name, value, inline) {
        return this.add(() => super.addField(name, value, inline), privateValidator);
    }

    add(superFunction, _privateValidator) {

        if (_privateValidator !== privateValidator) {
            throw new Error("add is private!");
        }

        if (!isFunction(superFunction)) {
            throw new TypeError("Incorrect type for add arguments!");
        }

        const temp = this.fields.splice(0, this.fields.length);
        superFunction();
        this.fields.splice(0, 0, ...temp);

        return this;
    }

    getLastUsableEmbed(_privateValidator) {

        if (_privateValidator !== privateValidator) {
            throw new Error("getLastUsableEmbed is private!");
        }

        const newEmbed = () => this.embeds[this.embeds.push(new Discord.RichEmbed()) - 1];
        const embedsLength = this.embeds.length;

        if (!embedsLength) {
            return newEmbed();
        }

        const lastEmbed = this.embeds[embedsLength - 1];
        if (lastEmbed.fields.length >= 25) {
            return newEmbed();
        }
        return lastEmbed;
    }

    toEmbeds() {

        this.embeds.splice(0, this.embeds.length);

        this.fields.forEach(field => this.getLastUsableEmbed(privateValidator).addField(field.name, field.value, field.inline));

        this.embeds.forEach(embed =>
            ["author", "color", "description", "footer", "image", "thumbnail", "timestamp", "title", "url"]
            .forEach(property => embed[property] = this[property]));

        const newLength = this.embeds.length;
        const embed = newLength ? this.embeds[newLength - 1] : this.getLastUsableEmbed();

        ["file", "files"].forEach(property => embed[property] = this[property]);

        return this.embeds;
    }

    async send(channel) {

        if (!(t(channel, Discord.DMChannel) || t(channel, Discord.TextChannel))) {
            throw new TypeError("Incorrect type(s) for send arguments!");
        }

        if (!channel.client.readyAt) {
            throw new Error("Client is not ready yet");
        }

        const results = [];
        for (const embed of this.toEmbeds()) {
            try {
                results.push(await channel.send(embed));
            } catch (error) {
                results.push(error);
            }
        }
        return results;
    }

    /**
     * @override
     */
    toString() {
        return super.toString().replace(/Object/g, this.constructor.name);
    }
}

module.exports = MultiRichEmbed;
