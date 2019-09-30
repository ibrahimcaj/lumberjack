# lumberjack

![LumberJack icon](https://cdn.discordapp.com/icons/592069129960423434/33606af5e595a840132c43a72ae5e784.webp?size=256)

A bot for lumberjack game, made for 2019 Discord Hack Week.

Check it out on the Discord Bot List! https://discordbots.org/bot/592760868647862273

## Badges
[![MIT License](https://img.shields.io/badge/license-MIT-0366d6.svg?longCache=true&style=flat-square)](/LICENSE) [![Node.js compatibility](https://img.shields.io/badge/node->%3D10.0.0-0366d6.svg?longCache=true&style=flat-square&logo=node.js&color=026e00)](https://nodejs.org/) [![Invite Lumberjack to Discord servers!](https://img.shields.io/badge/invite-to%20Discord-7289da.svg?longCache=true&style=flat-square&logo=discord)][OAuth2Link]

## Manual Testing
**To invite the bot and test it out, [use this link][OAuth2Link]!**

## Branches

* [***Reimplementation branch***](https://github.com/vanishedvan/lumberjack/tree/reimplementation-release)
* [***Master branch***](https://github.com/vanishedvan/lumberjack/tree/master)

## Commands

* `!add (<item> [amount]|balance <amount>)` - Developers of the project can use this command to add items or balance to themselves for the ease of testing. ![Only for developers][Only for developers badge]
* `!balance` - Take a peek at your wallet.
  * `!balance <user>` - Take a peek at someone else's wallet. Don't be caught.
* `!cut` - This is a really special command, use this glorious command to actually cut down trees and get 'em fancy and heavy wood logs. 5-minute cooldown.
* `!delete` - DANGEROUS! Delete your game data permanently.
* `!eval` - Evaluates JavaScript code represented as a string. ![Only for owner][Only for owner badge]
* `!fixdata` - Examine and fix corrupted data for all users in the database. ![Only for developers][Only for developers badge]
  * `!fixdata <user>` - Examine and fix corrupted data for specified user in the database. ![Only for developers][Only for developers badge]
* `!help` - It's just a list of my commands.
  * `!help <command>` - Get more detailed information about a command.
* `!inventory` - Check out what is in your bag.
  * `!inventory <user>` - Check out what is in someone else's bag. Sneaky...
* `!leaderboard [balance] [entries]` - Global leaderboard for user balance, top 10 users are displayed by default, maximum number of entries is 100.
  * `!leaderboard wood [entries]` - Global leaderboard for the number of Woods in inventory, top 10 users are displayed by default, maximum number of entries is 100.
* `!ping` - Displays the ping of Lumberjack bot.
* `!reload <command>` - Reloads a command. ![Only for developers][Only for developers badge]
* `!shop` - By using this command, you can get your hands on some of our most glorious axes and other cool items! You can also sell or get information on other items!
  * `!shop buy <item> [amount]` - Buy items from the shop.
  * `!shop sell <item> [amount]` - Sell items in your inventory.
  * `!shop [item] <item>` - Get information about an item from the shop.

## Bot Feature Details
- &#x2714;&#xFE0F; User starts with $0 and 1 free stick
- &#x2714;&#xFE0F; Sticks for getting started on wood cutting are free
- \* You need a license, costs $5
- &#x2714;&#xFE0F; You cut wood down with the cut command:
  - &#x2714;&#xFE0F; Bot sends "Searching for a good tree..."
  - &#x2714;&#xFE0F; After a short amount of time ranging from 3 to 6 seconds, bot sends a message, "I found a nice tree!". The bot will send a random character code that the user needs to send to cut the tree down
    - a) &#x2714;&#xFE0F; User gets that wood
    - b) &#x2714;&#xFE0F; Very rarely, tree falls on the user. The user "dies" (the inventory is cleared, and money is set to $0)
- &#x2714;&#xFE0F; 1 wood log costs $3
- &#x2714;&#xFE0F; User gets from 1 to 5 logs per tree taken down
- &#x2714;&#xFE0F; Shop with better tools
- &#x2714;&#xFE0F; Tools can break
- &#x2714;&#xFE0F; You can buy and sell, in bulk too
- &#x2714;&#xFE0F; You can view leaderboards for wood and balance
- You can give money and wood to other users
- \* Monsters can spawn nearby
- \* You can buy cool outfit
- \* And armor to protect you from monsters
- Tools:
  - a) &#x2714;&#xFE0F; Stick: Boring stick. - Free in the shop, can only be used 5 ~ 7 times.
  - b) &#x2714;&#xFE0F; Wooden axe: Better axe. - $15, can only be used 10 ~ 14 times.
  - c) &#x2714;&#xFE0F; Stone axe: Much better axe, you need to either \*(buy stone from the shop to make it (one stone costs $5, you need 5 to make an axe - $25)), or buy it from the shop - $30. Can be used 15 ~ 17 times.
  - d) &#x2714;&#xFE0F; Potato axe: $30, 9 ~ 11 time use, joke item.
  - e) &#x2714;&#xFE0F; Iron axe: Iron is expensive, $10 per iron bar. You \*(need 5 iron bars to make an axe), or buy the axe from the shop - $55. You can use it 20 ~ 23 times. Pretty good.
  - f) &#x2714;&#xFE0F; Golden axe: Gold is slightly more expensive than iron, $12 per gold bar. You \*(need 5 gold bars to make an axe), or buy the axe from the shop - $65. You can use it 25 ~ 27 times, even better.
  - g) &#x2714;&#xFE0F; Diamond axe: Pretty much the best axe. You are unable to craft it. Costs $70 in the shop. 30 time use.

Features marked with &#x2714;&#xFE0F; are completed, and ideas marked with \* are under evaluation.

## License
This project is licensed under [MIT License](/LICENSE).

> Copyright (c) 2019 vanished
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

[OAuth2Link]: https://discordapp.com/api/oauth2/authorize?client_id=592760868647862273&permissions=0&scope=bot
[Only for developers badge]: https://img.shields.io/badge/developers-only-f00.svg?longCache=true&style=flat-square
[Only for owner badge]: https://img.shields.io/badge/owner-only-f00.svg?longCache=true&style=flat-square
