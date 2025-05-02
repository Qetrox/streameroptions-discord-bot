const { SlashCommandBuilder, EmbedBuilder, Embed, ContextMenuCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const database = require('../../functions/streameroptions/sql');
const { getStreamerAutocomplete } = require('../../functions/streameroptions/autocomplete');
const { MessageEmbed } = require('discord.js');
const SOUtil = require('../../functions/streameroptions/util');

const languageJSON = require('../../language/language.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Change the language used for responses')
        .addStringOption((option) =>
            option
                .setName('language')
                .setDescription('Language to use for responses')
                .setRequired(true)
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Nederlands', value: 'nl' },
                    { name: 'Deutsch', value: 'de'},
                    { name: 'Français', value: 'fr'},
                    { name: 'Español', value: 'es'}
                )

        ),
    
    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('discord.js').Client} client
     * @returns {Promise<void>}
     */
    async execute(interaction, client, language) {

        const languageOpt = interaction.options.getString('language');
        const languageValues = languageJSON[languageOpt];
        const con = mysql.createConnection(database.getDatabaseCredentials(false));
        con.connect();
        con.query('INSERT INTO discordLanguage (discordId, language) VALUES (?, ?) ON DUPLICATE KEY UPDATE language = ?', [interaction.user.id, languageOpt, languageOpt], async (err, rows) => {
            con.end();
            if (err) {
                console.log(err);
                interaction.reply({ content: languageValues.CriticalError , ephemeral: true });
            } else {
                
                const embed = new EmbedBuilder()
                    .setTitle(languageValues.Title)
                    .setDescription(languageValues.Message)
                    .setColor('#2B2D31')
                    .setTimestamp()
                    .setFooter({ text: 'StreamerOptions.com' });

                interaction.reply({ embeds: [embed] });
            }
        });

    },
};