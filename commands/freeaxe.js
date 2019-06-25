const Discord = require("discord.js");
const sqlite3 = require('sqlite3');

const items = require('../items.json');

var item = Object.keys(items)[0]

let db = new sqlite3.Database('./structures/jack.db');

module.exports.run = async (client, msg, args) => {
	db.all("SELECT money, inventory FROM wood WHERE id = '" + msg.author.id + "'", function (err, rows) {
		var obj = JSON.parse(rows[0].inventory);
	
		obj["iron_axe"] = ["1"]
	
		var back = JSON.stringify(obj);		
	
		db.run(`INSERT INTO wood(id, inventory) VALUES(?, ?)`, [msg.author.id, back], function(err) {
			//console.log("Inserted.")
		});
	});
}

module.exports.help = {
  name: "freeaxe" 
}
