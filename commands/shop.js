const Discord = require("discord.js");
const sqlite3 = require('sqlite3');

const items = require('../items.json');

const db = new sqlite3.Database('./structures/jack.db').on("error", console.error);

module.exports.run = async (client, msg, args) => {

  const itemlist = Object.keys(items);
  const idAsNumber = Number(msg.author.id);
  db.all("SELECT money, inventory FROM wood WHERE id=?", idAsNumber, (err, rows) => {

    if (!rows.length) {
      rows[0] = {
        id: idAsNumber,
        money: 15,
        inventory: "{}"
      };
      db.run("INSERT INTO wood(id, inventory) VALUES(?, ?)", [idAsNumber, rows[0].inventory], err => {
        if (!err) {
          console.log("Inserted.");
        }
      });
    }

    if (!args.length) {
      const embed = new Discord.RichEmbed()
        .setAuthor("Shop")
        .setColor('#ff0000')
        .setFooter("Use !shop buy [item] to buy an item from the shop, or use !shop sell [item] to sell and item. | You can also use !shop [item] to look at item info.");

      for (let i = 0; i < itemlist.length; i++) {
        const item = items[itemlist[i]];
        embed.addField(`${item[2]} ${item[0]}`, `Description: ${item[1]}\nPrice: ${item[3]}${item.length === 5 ? `\nDurability: ${item[4]}` : ""}`);
      }

      msg.channel.send(embed);
    } else {
      switch (args[0]) {
        case "buy": {
          if (args.length === 1) {
            return msg.channel.send("Please specify what you want to buy!");
          }

          if (!itemlist.includes(args[1])) {
            return msg.channel.send("Mate, that item does not exist.");
          }
          const item = items[args[1]];

          const numberToBuy = args.length > 2 ? Number(args[2]) : 1;
          if (numberToBuy <= 0) {
            return msg.channel.send(numberToBuy ? "...what?? Use sell for that" : "But why?");
          }
          const obj = JSON.parse(rows[0].inventory);
          obj[args[1]] = obj[args[1]] == null ? numberToBuy : obj[args[1]] + numberToBuy;
          const difference = rows[0].money - (item[3] * numberToBuy);
          if (difference >= 0) {
            db.run("INSERT INTO wood(id, money, inventory) VALUES(?, ?, ?)", [idAsNumber, difference, JSON.stringify(obj)], err => {
              if (!err) {
                console.log("Inserted.");
              }
            });

          } else {
            return msg.channel.send("Don't try to scam me mate. You don't have enough money.");
          }
          break;
        }

        case "sell": {
          if (args.length === 1) {
            return msg.channel.send("Please specify what you want to sell!");
          }

          if (!itemlist.includes(args[1])) {
            return msg.channel.send("Mate, that item does not exist.");
          }
          const item = items[args[1]];

          const numberToSell = args.length > 2 ? Number(args[2]) : 1;
          if (numberToSell <= 0) {
            return msg.channel.send(numberToSell ? "...what?? Use buy for that" : "But why?");
          }
          const obj = JSON.parse(rows[0].inventory);
          if (obj[args[1]] == null || obj[args[1]] - numberToSell < 0) {
            return msg.channel.send(`Don't try to scam me mate. You don't have enough ${item[0]}s.`);
          }
          obj[args[1]] -= numberToSell;
          if (obj[args[1]] === 0) {
            delete obj[args[1]];
          }
          db.run("INSERT INTO wood(id, money, inventory) VALUES(?, ?, ?)",
            [idAsNumber, rows[0].money + (item[3] * numberToSell), JSON.stringify(obj)], err => {
            if (!err) {
              console.log("Inserted.");
            }
          });
          break;
        }

        case "item": {
          if (args.length === 1) {
            return msg.channel.send("Please specify an item!");
          }

          if (!itemlist.includes(args[1])) {
            return msg.channel.send("Mate, that item does not exist.");
          }
          const item = items[args[1]];
          const embed = new Discord.RichEmbed().setColor("#ff0000")
            .setAuthor(item[0])
            .addField("Description", item[1])
            .addField("Price", item[3]);
          if (item.length === 5) {
            embed.addField("Durability", item[4]);
          }
          msg.channel.send(embed).catch(console.error);
        }
      }
    }

  });
};

module.exports.help = {
  name: "shop"
};
