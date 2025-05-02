const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');
const mysql = require('mysql');
const database = require('../../functions/streameroptions/sql');
const { getStreamerAutocomplete } = require('../../functions/streameroptions/autocomplete');
const SOUtil = require('../../functions/streameroptions/util');

const languageJSON = require('../../language/points-leaderboard.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('points-leaderboard')
        .setDescription('View the points leaderboard of a streamer')
        .addStringOption((option) =>
            option
                .setName('streamer')
                .setDescription('Streamer to view the points leaderboard of')
                .setAutocomplete(true)
                .setRequired(true)
        ),
        
    async autocomplete(interaction, client, language) {
        const focusedValue = interaction.options.getFocused().toLowerCase();

        await interaction.respond(
            await getStreamerAutocomplete(focusedValue)
        );
        },
    
    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {import('discord.js').Client} client
     * @returns {Promise<void>}
     */
    async execute(interaction, client, language) {

        const languageValues = languageJSON[language];

        const streamer = interaction.options.getString('streamer');
        const con = mysql.createConnection(database.getDatabaseCredentials(false));
        con.connect();
        con.query('SELECT points, userDisplayname FROM points JOIN users ON viewerId = userId WHERE userUsername IS NOT NULL AND streamerId = (SELECT streamerUserId FROM streamer JOIN users ON streamerUserId = userId WHERE userUsername = ?) AND viewerId != (SELECT streamerUserId FROM streamer JOIN users ON streamerUserId = userId WHERE userUsername = ?) ORDER BY points DESC LIMIT 20', [streamer, streamer], async (err, rows) => {
            con.end();
            if (err) {
                console.log(err);
                interaction.reply({ content: languageValues.CriticalError , ephemeral: true });
            } else {
                if (rows.length === 0) {
                    interaction.reply({ content:  languageValues.NotFoundError + ` ${streamer}.`, ephemeral: true });
                } else {

                    let i = 0;
                    let text = '';

                    for (const row of rows) {
                        i++;
                        text += `**${i}. ${row.userDisplayname.replace(/_/g, '\\_').replace(/\*/g, '\\*').replace(/\|/g, '\\|')} \`${row.points} ${languageValues.Points}\`\n`
                    }

                    const { displayname } = await SOUtil.getProfileInfo(streamer);

                    const embed = new EmbedBuilder()
                        .setTitle(`${displayname}'s ` + languageValues.Title)
                        .setDescription(text)
                        .setColor('#2B2D31')
                        .setTimestamp()
                        .setFooter({ text: 'StreamerOptions.com' })

                    interaction.reply({ embeds: [embed] });
                }
            }
        });

    },
};