const Discord = require("discord.js");
const sqlite3 = require('sqlite3');

const items = require('../items.json');

const db = new sqlite3.Database('./structures/jack.db').on("error", console.error);

module.exports.run = async (client, msg, args) => {
  
  const itemlist = Object.keys(items);
  const idAsNumber = Number(msg.author.id);
  db.all("SELECT money FROM wood WHERE id=?", idAsNumber, (err, rows) => {
    const embed = new Discord.RichEmbed()
      .setAuthor("User Balance")
      .setColor("#ff0000")
      .setThumbnail("https://cdn.discordapp.com/emojis/593735754702651412.png")
      .addField("Balance:", rows[0].money + " coins")
      .setTimestamp()
      .setFooter(msg.author.username, msg.author.avatarURL);
    
    msg.channel.send(embed);
    
  });
}

module.exports.help = {
  name: "balance"
};
