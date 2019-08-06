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

const Syntax = require("./Syntax.js");
const {code} = require("../utility/MarkdownUtilities.js");
const {
    t,
    unwrap
} = require("../utility/Type.js");
const PREFIX = require("../config.json").prefix;

class Help {

    constructor(name, description, shouldDisplay) {

        name = unwrap(name);
        description = unwrap(description);
        shouldDisplay = unwrap(shouldDisplay);
        if (!(t(name, "string") && t(description, "string") && (shouldDisplay == null || t(shouldDisplay, "boolean")))) {
            throw new TypeError("Incorrect type(s) for Help arguments!");
        }

        this.name = name;
        this.description = description;
        this.syntax = new Syntax();
        this.shouldDisplay = shouldDisplay == null ? true : shouldDisplay;
        this.subCommands = [];
        this.content = this.description;
    }

    addSubCommands(...subCommands) {

        if (!(Array.isArray(subCommands) && subCommands.every(subCommand => t(subCommand, Help)))) {
            throw new TypeError("Incorrect type for addSubCommands arguments!");
        }

        subCommands.forEach(subCommand => {
            subCommand.parent = this;
            this.subCommands.push(subCommand);
        })
        return this;
    }

    setContent(string) {

        string = unwrap(string);
        if (!(string == null || t(string, "string"))) {
            throw new TypeError("Incorrect type for setContent argument!");
        }

        this.content = string == null ? this.description : string;
        return this;
    }

    setSyntax(syntax) {

        if (!(syntax == null || t(syntax, Syntax))) {
            throw new TypeError("Incorrect type for setSyntax argument!");
        }

        this.syntax = syntax ? syntax : new Syntax();
        return this;
    }

    /**
     * @override
     */
    toString() {

        if (!this.shouldDisplay) {
            return "";
        }

        let name = `${this.name}${this.syntax}`;
        let level = 0;
        let parent = this.parent;

        while (parent) {
            name = `${parent.name} ${name}`;
            level++;
            parent = parent.parent;
        }

        const string = `${"- ".repeat(level)}${code(`${PREFIX}${name}`)} - ${this.description}`;
        const subCommands = this.subCommands;
        if (!subCommands.length) {
            return string;
        }
        return `${string}\n${subCommands.join("\n")}`;
    }
}

module.exports = Help;
