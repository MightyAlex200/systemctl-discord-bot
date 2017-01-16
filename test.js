switch(parsed[0]){
    case "servers":
        message.reply(client.guilds.array().toString().replace(",", ", "));
        break;

    case "server": 
        if (this.server) {
            message.reply(this.server.name);
        } else {
            message.reply("Not in server");
        }
        break;

    case "channels": 
        if (this.server) {
            message.reply(this.server.channels.array().toString().replace(/,/g, ", "));
        } else {
            message.reply("Not in server");
        }
        break;

    case "channel": 
        if (this.channel) {
            message.reply(this.channel.name + " in " + this.server.name);
        } else {
            message.reply("Not in channel");
        }
        break;

    case "joinserver": 
        var jointext = message.content.slice(11);
        var tojoin = client.guilds.findAll('name', jointext)[0];
        if (tojoin) {
            message.reply("Joined server " + jointext);
            this.server = tojoin;
        } else {
            message.reply("Server not found: " + jointext)
        }
        break;

    case "joinchannel":
        if(this.server){
            var jointext = message.content.slice(12).replace("#", "");
            var tojoin = this.server.channels.findAll('name', jointext)[0];
            if (tojoin) {
                message.reply("Joined channel " + jointext);
                this.channel = tojoin;
            } else {
                message.reply("Channel not found: " + jointext)
            }
        }
        break;
    case "say": 
        if (this.channel){
            var saytext = message.content.slice(4);
            if (this.channel.type == "text") {
                this.channel.sendMessage(saytext);
            } else {
                message.reply(this.channel.type + " channel");
            }
        }
        break;
}