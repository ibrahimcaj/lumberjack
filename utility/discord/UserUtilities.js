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

function resolveUser(source, client, disableFetchById) {

    if (t(source, Discord.User)) {
        return source;
    }

    if (t(source, Discord.Client) || t(source, Discord.GuildMember)) {
        return source.user;
    }

    source = unwrap(source);
    disableFetchById = unwrap(disableFetchById);
    if (!(t(source, "string") && t(client, Discord.Client) && (disableFetchById == null || t(disableFetchById, "boolean")))) {
        throw new TypeError("Incorrect type(s) for resolveUser arguments!");
    }

    const matchedUsers = new Set();
    return new Promise(async (resolve, reject) => {

        if (!client.readyAt) {
            return reject(new Error("Client is not ready yet"));
        }

        if (!disableFetchById) {
            try {
                matchedUsers.add(await client.fetchUser(source));
            } catch (ignored) {}
        }

        const isMatched = user => user.id === source || user.username === source || user.tag === source ||
            new RegExp(`^<@\\!?${user.id}>$`).test(source);

        for (const guildEntry of client.guilds) {
            await guildEntry[1].fetchMembers().catch(console.error);
        }
        client.guilds.forEach(guild => guild.members.filter(member => isMatched(member.user) || member.nickname === source)
        .forEach(member => matchedUsers.add(member.user)));

        client.users.filter(user => !Array.from(matchedUsers).some(matchedUser => user.id === matchedUser.id) && isMatched(user))
        .forEach(user => matchedUsers.add(user));

        resolve(Array.from(matchedUsers));
    });
}

function resolveUserInGuilds(source, ...guilds) {

    if (!(guilds.length && guilds.every(guild => t(guild, Discord.Guild)))) {
        throw new TypeError("Incorrect type for resolveUserInGuilds arguments!");
    }

    return resolveUser(source, guilds[0].client).then(resolved => {
        const userIsInGuilds = (user, guilds) => guilds.some(guild => guild.members.some(member => member.user.id === user.id));

        if (Array.isArray(resolved)) {
            return resolved.filter(user => userIsInGuilds(user, guilds));
        }

        return userIsInGuilds(resolved, guilds) ? resolved : undefined;
    });
}

async function resolveUserRecursively(source, client, continueRecursionOnFound, disableFetchById) {

    source = unwrap(source);
    continueRecursionOnFound = unwrap(continueRecursionOnFound);
    disableFetchById = unwrap(disableFetchById);
    if (!(t(source, "string") && t(client, Discord.Client) &&
        (continueRecursionOnFound == null || t(continueRecursionOnFound, "boolean")) &&
        (disableFetchById == null || t(disableFetchById, "boolean")))) {
        throw new TypeError("Incorrect type(s) for resolveUserRecursively arguments!");
    }

    const resolved = await resolveUser(source, client, disableFetchById);
    return (resolved.length && !continueRecursionOnFound) || !source.includes(" ") ? resolved :
        resolved.concat(await resolveUserRecursively(
            source.replace(/\s+\S+$/gi, ""), client, continueRecursionOnFound, disableFetchById));
}

async function resolveUserInGuildsRecursively(source, continueRecursionOnFound, ...guilds) {

    source = unwrap(source);
    continueRecursionOnFound = unwrap(continueRecursionOnFound);
    if (!(t(source, "string") && (continueRecursionOnFound == null || t(continueRecursionOnFound, "boolean")) &&
        guilds.length && guilds.every(guild => t(guild, Discord.Guild)))) {
        throw new TypeError("Incorrect type(s) for resolveUserInGuildsRecursively arguments!");
    }

    const resolved = await resolveUserInGuilds(source, ...guilds);
    return (resolved.length && !continueRecursionOnFound) || !source.includes(" ") ? resolved :
        resolved.concat(await resolveUserInGuildsRecursively(
            source.replace(/\s+\S+$/gi, ""), continueRecursionOnFound, ...guilds));
}

function hasMentionFor(message, user) {

    if (!(t(message, Discord.Message) && (t(user, Discord.User) || t(user, Discord.GuildMember)))) {
        throw new TypeError("Incorrect type(s) for hasMentionFor arguments!");
    }

    const content = message.content;
    const matched = content.match(new RegExp(`<@\\!?${user.id}>`, "gi"));
    if (!matched) {
        return false;
    }

    const backSlashMatched = content.match(new RegExp(`\\\\*<@\\!?${user.id}>`, "gi"));
    let hasMatch = false;

    for (let i = 0; i < matched.length; i++) {
        if (!((backSlashMatched[i].length - matched[i].length) % 2)) {
            hasMatch = true;
            break;
        }
    }
    return hasMatch;
}

module.exports = {
    resolveUser,
    resolveUserInGuilds,
    resolveUserRecursively,
    resolveUserInGuildsRecursively,
    hasMentionFor
};
