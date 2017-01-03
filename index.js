const Discord = require('discord.js');
const client = new Discord.Client();

class Bot {

    constructor() {
        this.aspamlist = {
            systemctl: 1
        };
    }

    parse(message) {
        if (message.content.startsWith("systemctl")) {
            // This is a command
            if (message.content.startsWith("say", 10)) {
                message.channel.sendMessage(message.content.replace("systemctl say ", ""));
                if (message.deletable)
                    message.delete();
            }
        }
        this.aspamlist[message.author.username] = Math.min(this.aspamlist[message.author.username] + 1 || 1, 5);
        console.log(message.author.username + ": " + this.aspamlist[message.author.username] + ": " + message.content);
        if (this.aspamlist[message.author.username] >= 5) {
            console.log(this.aspamlist.systemctl);
            if (this.aspamlist.systemctl <= 1)
                message.reply('Slow down! You\'ve posted too many things at once.');
            if (message.deletable)
                message.delete();
        }
    }

}

var b = new Bot();

client.on('ready', () => {
    console.log('Bot online :)');
});

client.on('message', message => {
    b.parse(message);
});

client.login('MjY1NTcyNDk2MjIzMzcxMjY1.C0xFlg.nraNxYADdNfkWSCdgCHTCsAKLss');

setInterval(function () {
    for (var spamval in b.aspamlist) {
        b.aspamlist[spamval] = Math.max(b.aspamlist[spamval] - 1, 0);
    }
}, 2500);