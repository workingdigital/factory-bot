const Discord = require('discord.js');
const levelManager = require('./plugins/levelManager.js');
const bot = new Discord.Client();
var config = require('./config.json');

bot.on('ready', function () {
    console.log(config.hellomessage);
    bot.on('message', message => {
        if (message.author['id'] != config.ENV.BOTID) {
            if (message.content == "/level") {
                levelManager.showLevelCommand(message, config);
            } else {
                levelManager.exec(message, config);
            }
        }
    });
});

bot.login(config.ENV.BOTTOKEN)
