const Discord = require("discord.js");
const sqlite3 = require('sqlite3');

const items = require('../items.json');

const db = new sqlite3.Database('./structures/jack.db').on("error", console.error);

module.exports.run = async (client, msg) => {
  const idAsNumber = Number(msg.author.id);
  db.all("SELECT money, inventory FROM wood WHERE id=?", idAsNumber, (err, rows) => {

    if (!rows.length) {
      rows[0] = {
        id: idAsNumber,
        money: 15,
        inventory: "{}"
      };
      db.run("INSERT INTO wood(id, inventory) VALUES(?, ?)", idAsNumber, rows[0].inventory);
    }

    const inv = JSON.parse(rows[0].inventory);

    const embed = new Discord.RichEmbed()
      .setColor('#ff0000')
      .setAuthor("Inventory");

    for (let i = 0; i < Object.keys(inv).length; i++) {

      const itemconfig = items[Object.keys(inv)[i]];

      const amount = inv[Object.keys(inv)[i]];
      if (amount !== 0) {
        embed.addField(`${itemconfig[2]} ${itemconfig[0]}`, `Amount: ${amount}`);
      }
    }

    if (!embed.fields.length) {
      embed.addField("No items.", "Oh look. Its empty.");
    }

    msg.channel.send(embed);

  });

};

module.exports.help = {
  name: "inventory"
};
