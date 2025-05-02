const mysql = require('mysql');
const database = require('../../functions/streameroptions/sql');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;
            try {
                const con = mysql.createConnection(database.getDatabaseCredentials(false));
                con.connect();
                con.query('SELECT language FROM discordLanguage WHERE discordId = ?', [interaction.user.id], async (err, rows) => {
                    con.end();
                    if (err) {
                        console.log(err);
                        await interaction.reply({
                            content: `:satellite_orbital: An error occurred while executing this command. Please try again later.`,
                            ephemeral: true
                        });
                    } else {
                        let language = 'en';
                        if (rows.length > 0) {
                            language = rows[0].language;
                        }
                        await command.execute(interaction, client, language);
                    }
                });

            } catch (error) {
                console.error(error)
                await interaction.reply({
                    content: `Something went wrong while executing command.`,
                    ephemeral: true
                });
            }
        } else if (interaction.isButton()) {
            const { buttons } = client;
            const { customId } = interaction;
            const button = buttons.get(customId);
            if (!button) return new Error('There is no code for this button');

            try{
                const con = mysql.createConnection(database.getDatabaseCredentials(false));
                con.connect();
                con.query('SELECT language FROM discordLanguage WHERE discordId = ?', [interaction.user.id], async (err, rows) => {
                    con.end();
                    if (err) {
                        console.log(err);
                        await interaction.reply({
                            content: `:satellite_orbital: An error occurred while executing this command. Please try again later.`,
                            ephemeral: true
                        });
                    } else {
                        let language = 'en';
                        if (rows.length > 0) {
                            language = rows[0].language;
                        }
                        await button.execute(interaction, client, language);
                    }
                });
            } catch (err) {
                console.error(err)
            }
        } else if (interaction.isAutocomplete()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            try {
                const con = mysql.createConnection(database.getDatabaseCredentials(false));
                con.connect();
                con.query('SELECT language FROM discordLanguage WHERE discordId = ?', [interaction.user.id], async (err, rows) => {
                    con.end();
                    if (err) {
                        console.log(err);
                        await interaction.reply({
                            content: `:satellite_orbital: An error occurred while executing this command. Please try again later.`,
                            ephemeral: true
                        });
                    } else {
                        let language = 'en';
                        if (rows.length > 0) {
                            language = rows[0].language;
                        }
                        await command.autocomplete(interaction, client, language);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }
    }
}
