const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { Token } = require("./config.json");
const fs = require('fs');
const readyFunction = require('./functions/streameroptions/ready');
const streamerLiveNotification = require('./functions/streameroptions/streamerLiveNotification');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
    ],
})
client.commands = new Collection();
client.buttons = new Collection()
client.commandArray = [];

client.on('ready', () => {
    readyFunction.init(client);
    setClients();
})

const functionFolders = fs.readdirSync(`./functions`);
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./functions/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of functionFiles) {
        if(folder !== "streameroptions") {
            require(`./functions/${folder}/${file}`)(client);
        }
    }
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(Token);

function setClients() {
    streamerLiveNotification.setClient(client);
}