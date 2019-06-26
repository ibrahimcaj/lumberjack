const Discord = require("discord.js");
const sqlite3 = require('sqlite3');

const items = require('../items.json');

const db = new sqlite3.Database('./structures/jack.db').on("error", console.error);

module.exports.run = async (client, msg, args) => {

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

      const itemlist = Object.keys(items);

      for (let i = 0; i < itemlist.length; i++) {
        const item = items[itemlist[i]];
        embed.addField(`${item[2]} ${item[0]}`, `Description: ${item[1]}\nPrice: ${item[3]}${item.length === 5 ? `\nDurability: ${item[4]}` : ""}`);
      }

      msg.channel.send(embed);
    } else if (args[0] === "buy") {
      for (let i = 0; i < itemlist.length; i++) {
        if (args.length === 1) {
          return msg.channel.send("Please specify what you want to buy!");
        }

        if (!itemlist.contains(args[1])) { //this will not work
          return msg.channel.send("Mate, that item does not exist.");
        }

        const difference = rows[0].money - item[3];
        if (difference >= 0) {
          db.run(`INSERT INTO wood(id, money) VALUES(?, ?)`, [idAsNumber, difference], err => {
            if (!err) {
              console.log("Inserted.");
            }
          });

        } else {
          return msg.channel.send("Don't try to scam me mate. You don't have enough money.");
        }
      }
    }

  });
};

module.exports.help = {
  name: "shop"
};
