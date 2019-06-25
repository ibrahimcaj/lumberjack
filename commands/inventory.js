const Discord = require("discord.js");
const sqlite3 = require('sqlite3');
const random = require('random-value-generator');

const items = require('../items.json');

var item = Object.keys(items)[0]

let db = new sqlite3.Database('./structures/jack.db');

module.exports.run = async (client, msg, args) => {
  db.all("SELECT money, inventory FROM wood WHERE id = '" + msg.author.id + "'", function (err, rows) {
    
    if (rows[0] === undefined) {
      db.run(`INSERT INTO wood(id, inventory) VALUES(?, ?)`, [msg.author.id, "{}"], function(err) {
        //console.log("Inserted.");
      });
    }
    
    var inv = JSON.parse(rows[0].inventory);
    
    var back = JSON.stringify(inv);
    
    if (rows[0].inventory === "{}") {
    	const embed = new Discord.RichEmbed()
      	.setColor('#ff0000')
      	.setAuthor("Inventory")
      	.addField("No items.", "Oh look. Its empty.")
      	
        return msg.channel.send(embed);
    }
    
    var itemcount = Object.keys(inv).length
    
    const embed = new Discord.RichEmbed()
      .setColor('#ff0000')
      .setAuthor("Inventory")
      
    for (i = 0; i < itemcount; i++) {
      //var invitem = obj[0]    	
      var item = Object.keys(inv)
      
      var itemconfig = items[item[i]]
      
      var amnt = Object.keys(inv)
      var amount = inv[amnt[i]]
      
      embed.addField(itemconfig[2]+ " " + itemconfig[0], "Amount: " + amount)
    }
    
    msg.channel.send(embed);
    
  });

}

module.exports.help = {
  name: "inventory"
}
