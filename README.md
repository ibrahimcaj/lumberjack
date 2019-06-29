# lumberjack

![LumberJack icon](https://cdn.discordapp.com/icons/592069129960423434/33606af5e595a840132c43a72ae5e784.webp?size=256)

A bot for lumberjack game, made for Discord Hack Week.

* [***Reimplementation ("light" branch)***](https://github.com/vanishedvan/lumberjack/tree/light): With Rich Embeds everywhere, variable tool durability, separate durability per tool, tree potentially falling on user, tool selling, more intuitive item name inputting, bug fixes, and more.
* [***Master branch***](https://github.com/vanishedvan/lumberjack/tree/master)

## Bot Feature Details:
- User starts with $0 and 1 free stick
- Sticks for getting started on wood cutting are free
- \* You need a license, costs $5
- You cut wood down with the cut command:
  - User sends the cut command
  - Bot sends "Searching for a good tree..."
  - After a short amount of time, bot sends a message, "I found a nice tree!". The bot will send a random character code that the user needs to send to cut the tree down
    - a) User gets that wood
    - b) Very rarely, tree falls on the user. The user "dies" (the inventory is cleared, and money is set to $0)
- 1 wood log costs $3
- User gets from 1 to 5 logs per tree taken down
- Shop with better tools
- Tools can break
- You can buy and sell wood, in bulk too
- \* You can give money and wood to other users
- \* Monsters can spawn nearby
- \* You can buy cool outfit
- \* And armor to protect you from monsters
- Tools:
  - a) Stick: Boring stick. - Free in the shop, can only be used 5 ~ 7 times.
  - b) Wooden axe: Better axe. - $15, can only be used 10 ~ 14 times.
  - c) Stone axe: Much better axe, you need to either \*(buy stone from the shop to make it (one \*(stone) costs $5, you need 5 to make an axe - $25)), or buy it from the shop - $30. Can be used 15 ~ 17 times.
  - d) \* Potato axe: $30, 9 ~ 11 time use, joke item.
  - e) Iron axe: Iron is expensive, $10 per \*(iron bar). You \*(need 5 iron bars to make an axe), or buy the axe from the shop - $55. You can use it 20 ~ 23 times. Pretty good.
  - f) \* Golden axe
  - g) Diamond axe: Pretty much the best axe. You are unable to craft it. Costs $70 in the shop. 30 time use.

Ideas marked with \* are under evaluation and might not be added.

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
