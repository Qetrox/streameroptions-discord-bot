const { Client, ActivityType } = require("discord.js");
const WebSocketClient = require('./websocketClient');

/**
 * 
 * @param {Client} client 
 */
function init(client) {
    client.user.setActivity(
        'www.Streameroptions.com', 
        { 
            type: ActivityType.Custom, 
            state: '👉 Streameroptions.com',
            url: 'https://www.streameroptions.com'
        }
    );
    WebSocketClient.init();
}


module.exports = {
    init
}