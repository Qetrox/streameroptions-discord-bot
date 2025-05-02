const { SlashCommandBuilder, EmbedBuilder, Embed, ContextMenuCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql');
const database = require('../../functions/streameroptions/sql');
const { getStreamerAutocomplete } = require('../../functions/streameroptions/autocomplete');
const { MessageEmbed } = require('discord.js');
const SOUtil = require('../../functions/streameroptions/util');

const languageJSON = require('../../language/notification.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notification')
        .setDescription('Notifications for when a streamer goes live')
        .addSubcommand((subcommand) =>
            subcommand
            .setName('add')
            .setDescription('Get notifications for when a streamer goes live')
            .addChannelOption((option) =>
                option
                .setName('channel')
                .setDescription('Channel to send notifications to')
                .setRequired(true)
            )
            .addStringOption((option) =>
                option
                .setName('streamer')
                .setDescription('Streamer to get notifications for')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName('remove')
            .setDescription('Remove notifications for when a streamer goes live')
            .addChannelOption((option) =>
                option
                .setName('channel')
                .setDescription('Channel to send notifications to')
                .setRequired(true)
            )
            .addStringOption((option) =>
                option
                .setName('streamer')
                .setDescription('Streamer to get notifications for')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName('list')
            .setDescription('List all notifications for a channel')
            .addChannelOption((option) =>
                option
                .setName('channel')
                .setDescription('Channel to check notifications for')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),

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
        const subCommand = interaction.options.getSubcommand()
        const GuildId = interaction.guild.id;

        if(subCommand == 'add' || subCommand == 'remove') {

            let con = mysql.createConnection(database.getDatabaseCredentials(false));
            con.connect();
            con.query('select * from streamer where streamerUserId = (select userId from users where userUsername = ? OR userDisplayname = ?)', [interaction.options.getString('streamer'), interaction.options.getString('streamer')], async (err, rows) => {
                con.end();
                if(err) {
                    interaction.reply({ content: languageValues.CriticalError, ephemeral: true });
                    console.log(err);
                    return;
                }
                if(rows.length == 0) {
                    interaction.reply({ content: languageValues.NotFoundError, ephemeral: true });
                    return;
                }

                const StreamerId = rows[0].streamerUserId;
                const ChannelId = interaction.options.getChannel('channel').id;

                if(subCommand == 'add') {
                    con = mysql.createConnection(database.getDatabaseCredentials(false));
                    con.connect();
                    con.query('select * from discordStreamerNotifications where guildId = ?', [GuildId], async (err, rows) => {
                        con.end();
                        if(err) {
                            interaction.reply({ content: languageValues.CriticalError, ephemeral: true });
                            console.log(err);
                            return;
                        }
                        if(rows.length >= 5) {
                            const embed = new EmbedBuilder()
                                .setTitle(languageValues.Title_del_not_found)
                                .setDescription(languageValues.MaxNotifications)
                                .setColor('#2B2D31')
                                .setTimestamp()
                                .setFooter({ text: 'StreamerOptions.com' });
                            interaction.reply({ embeds: [embed], ephemeral: true });
                            return;
                        }
                        if(rows.filter(row => row.streamerId == StreamerId && row.channelId == ChannelId).length > 0) {
                            const embed = new EmbedBuilder()
                                .setTitle(languageValues.Title_del_not_found)
                                .setDescription(languageValues.AlreadyNotified)
                                .setColor('#2B2D31')
                                .setTimestamp()
                                .setFooter({ text: 'StreamerOptions.com' });
                            interaction.reply({ embeds: [embed], ephemeral: true });
                            return;
                        }

                        con = mysql.createConnection(database.getDatabaseCredentials(false));
                        con.connect();
                        con.query('insert into discordStreamerNotifications (guildId, streamerId, discordUserId, channelId) values (?, ?, ?, ?)', [GuildId, StreamerId, interaction.user.id, ChannelId], async (err, rows) => {
                            con.end();
                            if(err) {
                                interaction.reply({ content: languageValues.CriticalError, ephemeral: true });
                                console.log(err);
                                return;
                            }

                            const embed = new EmbedBuilder()
                                .setTitle(languageValues.Title_add)
                                .setDescription(languageValues.Message_add)
                                .setColor('#2B2D31')
                                .setTimestamp()
                                .setFooter({ text: 'StreamerOptions.com' });
                            interaction.reply({ embeds: [embed], ephemeral: true });
                        });

                    });
                } else if (subCommand == 'remove') {

                    con = mysql.createConnection(database.getDatabaseCredentials(false));
                    con.connect();
                    con.query('delete from discordStreamerNotifications where guildId = ? and streamerId = ? and channelId = ?', [GuildId, StreamerId, ChannelId], async (err, rows, fields) => {
                        con.end();
                        if(err) {
                            interaction.reply({ content: languageValues.CriticalError, ephemeral: true });
                            console.log(err);
                            return;
                        }

                        if(rows.affectedRows == 0) {

                            const embed = new EmbedBuilder()
                                .setTitle(languageValues.Title_del_not_found)
                                .setDescription(languageValues.Message_del_not_found)
                                .setColor('#2B2D31')
                                .setTimestamp()
                                .setFooter({ text: 'StreamerOptions.com' });
                            interaction.reply({ embeds: [embed], ephemeral: true });
                            return;
                        } else {
                            const embed = new EmbedBuilder()
                                .setTitle(languageValues.Title_del)
                                .setDescription(languageValues.Message_del)
                                .setColor('#2B2D31')
                                .setTimestamp()
                                .setFooter({ text: 'StreamerOptions.com' });
                            interaction.reply({ embeds: [embed], ephemeral: true });
                            return;
                        }
                    });

                }
            });
        } else if (subCommand == 'list') {
                
                const ChannelId = interaction.options.getChannel('channel').id;
    
                let con = mysql.createConnection(database.getDatabaseCredentials(false));
                con.connect();
                con.query('select * from discordStreamerNotifications JOIN users ON streamerId = userId where guildId = ? and channelId = ?', [GuildId, ChannelId], async (err, rows) => {
                    con.end();

                    if(err) {
                        interaction.reply({ content: languageValues.CriticalError, ephemeral: true });
                        console.log(err);
                        return;
                    }

                    if(rows.length == 0) {
                        const embed = new EmbedBuilder()
                            .setTitle(languageValues.Title_list)
                            .setDescription(languageValues.NoStreamersFollowed)
                            .setColor('#2B2D31')
                            .setTimestamp()
                            .setFooter({ text: 'StreamerOptions.com' });
                        interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }

                    let description = '';
                    let i = 0;
                    for(const row of rows) {
                        i++;
                        description += `**${i}. ${row.userDisplayname.replace(/_/g, '\\_').replace(/\*/g, '\\*').replace(/\|/g, '\\|')}**${languageValues.added} <@${row.discordUserId}> <t:${Math.floor(new Date(row.timestamp).getTime() / 1000 + 3600)}:f>\n`;
                    }

                    const embed = new EmbedBuilder()
                        .setTitle(languageValues.Title_list)
                        .setDescription(description)
                        .setColor('#2B2D31')
                        .setTimestamp()
                        .setFooter({ text: 'StreamerOptions.com' });
                    interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                });
        }

    },
};