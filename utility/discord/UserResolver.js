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
} = require("../Type.js");
const Discord = require("discord.js");

const privateValidator = Symbol();
let instance;

class UserResolver {

    constructor(_privateValidator) {

        if (_privateValidator !== privateValidator) {
            throw new Error("UserResolver is private!");
        }

        this.guildBlacklist = [];
        this.userBlacklist = [];
    }

    static getInstance() {

        if (!instance) {
            instance = new UserResolver(privateValidator);
        }

        return instance;
    }

    static get Option() {
        return UserResolverOption;
    }

    addToBlacklist(target) {

        const isGuild = t(target, Discord.Guild);
        if (!(t(target, Discord.User) || t(target, Discord.GuildMember) || isGuild)) {
            throw new TypeError("Incorrect type for addToBlacklist argument!");
        }

        const id = target.id;
        const list = isGuild ? this.guildBlacklist : this.userBlacklist;
        if (!list.includes(id)) {
            list.push(id);
        }

        return this;
    }

    deleteFromBlacklist(target) {

        const isGuild = t(target, Discord.Guild);
        if (!(t(target, Discord.User) || t(target, Discord.GuildMember) || isGuild)) {
            throw new TypeError("Incorrect type for deleteFromBlacklist argument!");
        }

        const id = target.id;
        const list = isGuild ? this.guildBlacklist : this.userBlacklist;
        if (list.includes(id)) {
            list.splice(list.indexOf(id), 1);
        }

        return this;
    }

    resolveUser(source, client, option) {

        if (t(client, UserResolverOption) && option == null) {
            option = client;
            client = undefined;
        }

        if (option == null) {
            option = new UserResolverOption({});
        }

        if (!((client == null || t(client, Discord.Client)) && t(option, UserResolverOption))) {
            throw new TypeError("Incorrect type(s) for resolveUser arguments!");
        }

        const limitedGuilds = option.limitToGuilds;
        if (t(source, Discord.GuildMember)) {

            const guildId = source.guild.id;
            if (this.guildBlacklist.includes(guildId) ||
                (limitedGuilds && !limitedGuilds.some(limitedGuild => limitedGuild.id === guildId))) {
                return Promise.resolve();
            }
            source = source.user;

        } else if (t(source, Discord.Client)) {
            source = source.user;
        }

        if (t(source, Discord.User)) {
            return Promise.resolve(this.userBlacklist.includes(source.id) ? undefined : source);
        }

        source = unwrap(source);
        if (!(t(source, "string") && t(client, Discord.Client))) {
            throw new TypeError("Incorrect type(s) for resolveUser arguments!");
        }
        source = source.substring(0, 32 + "#0000".length);

        const matchedUsers = new Set();
        return new Promise(async (resolve, reject) => {

            if (!client.readyAt) {
                return reject(new Error("Client is not ready yet"));
            }

            if (!option.disableFetchById) {
                try {
                    matchedUsers.add(await client.fetchUser(source));
                } catch (ignored) {}
            }

            let filteredGuilds = client.guilds.filter(guild => !this.guildBlacklist.includes(guild.id));
            if (limitedGuilds) {
                filteredGuilds = filteredGuilds.filter(guild => limitedGuilds.some(limitedGuild => limitedGuild.id === guild.id));
            }
            for (const guild of filteredGuilds.values()) {
                await guild.fetchMembers().catch(console.error);
            }

            const toProperCase = string => option.ignoreCase ? string.toLowerCase() : string;
            const isMatched = user => {
                const userId = user.id;
                return [userId, user.username, user.tag].some(string => toProperCase(string) === toProperCase(source)) ||
                    new RegExp(`^<@\\!?${userId}>$`).test(source);
            };
            const isNotBlacklisted = userOrMember => !this.userBlacklist.includes(userOrMember.id);

            filteredGuilds.forEach(guild => guild.members
                .filter(isNotBlacklisted)
                .filter(member => isMatched(member.user) || toProperCase(member.nickname) === toProperCase(source))
                .forEach(member => matchedUsers.add(member.user)));

            if (option.includeCache) {
                client.users.filter(user => user.id !== "1")
                .filter(user => !Array.from(matchedUsers).some(matchedUser => user.id === matchedUser.id))
                .filter(isNotBlacklisted)
                .filter(isMatched)
                .forEach(matchedUsers.add);
            }

            const array = Array.from(matchedUsers);
            resolve(!option.recursive || (array.length && !option.continueRecursionOnFound) || !source.includes(" ") ?
                array : array.concat(await this.resolveUser(source.replace(/\s+\S+$/gi, ""), client, option)));
        });
    }
}

// {
//      disableFetchById: boolean
//      includeCache: boolean
//      ignoreCase: boolean
//      recursive: boolean
//      continueRecursionOnFound: boolean
//      limitToGuilds: Guild[]
// }
class UserResolverOption {

    constructor(object) {

        if (!t(object, "object")) {
            throw new TypeError("Incorrect type for UserResolverOption argument!");
        }

        ["disableFetchById", "includeCache", "ignoreCase", "recursive", "continueRecursionOnFound"].forEach(property => {

            const value = unwrap(object[property]);
            if (!(value == null || t(value, "boolean"))) {
                throw new TypeError(`Incorrect type for ${property} property!`);
            }
            this[property] = value;
        });

        const guilds = object.limitToGuilds;
        if (!(guilds == null || (Array.isArray(guilds) && guilds.every(guild => t(guild, Discord.Guild))))) {
            throw new TypeError("Incorrect type for limitToGuilds property!");
        }
        this.guilds = Array.isArray(guilds) && !guilds.length ? undefined : guilds;
    }
}

module.exports = UserResolver;
