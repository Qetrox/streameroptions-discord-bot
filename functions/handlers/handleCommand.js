const { REST, Routes } = require('discord.js')
const fs = require('fs')
const { Token, ClientId } = require('../../config.json');

module.exports = client => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./commands')
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'))

            const { commands, commandArray } = client
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`)
                await commands.set(command.data.name, command)
                commandArray.push(command.data.toJSON())
            }
        }

        const rest = new REST({ version: '10' }).setToken(Token)
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(Routes.applicationCommands(ClientId), {
                body: client.commandArray,
            })

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error)
        }
    }
}