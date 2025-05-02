const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mysql = require('mysql');
const database = require('./sql')

let client;

function setClient(newClient) {
    client = newClient;
}

async function sendLiveNotification(data) {

    const watchButton = new ButtonBuilder()
        .setLabel('Watch now!')
        .setURL(`https://www.twitch.tv/${data.username}`)
        .setStyle(ButtonStyle.Link);

    const SoButton = new ButtonBuilder()
        .setLabel('SO Profile')
        .setURL(`https://streameroptions.com/${data.username}`)
        .setStyle(ButtonStyle.Link);

    const CompontentsRow = new ActionRowBuilder()
        .addComponents(watchButton, SoButton)


    let con = mysql.createConnection(database.getDatabaseCredentials());
    con.connect();
    con.query('SELECT CAST(guildId AS CHAR) AS guildId, CAST(channelId AS CHAR) AS channelId, userProfileImageUrl FROM discordStreamerNotifications JOIN users ON streamerId = userId where streamerId = ?', [data.streamerid], (err, result) => {
        con.end();
        if (err) {
            console.log(err);
            return;
        }

        let profileImage = 'https://streameroptions.com/i/so_small_logo_white.png';
        
        if (result.length > 0) {

            profileImage = result[0].userProfileImageUrl;
            const Globalchannel = client.channels.cache.get('1018185525410136087');
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setURL(`https://www.twitch.tv/${data.username}`)
                .setDescription(data.game !== 'Just Chatting' ? `Streaming \`${data.game}\`` : data.game)
                .setColor('#2B2D31')
                .setAuthor({ name: data.displayname, iconURL: profileImage })
                .setFooter({ text: 'StreamerOptions.com' })
                .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.username}-1920x1080.jpg`)
                .setTimestamp();
            Globalchannel.send({
                content: 'General live notification:',
                embeds: [embed],
                components: [CompontentsRow]
            });
            result.forEach((row) => {

                const guild = client.guilds.cache.get(`${row.guildId}`);
                if (guild) {
                    const channel = guild.channels.cache.get(`${row.channelId}`);
                    if (channel) {
                        channel.send({
                            embeds: [embed],
                            components: [CompontentsRow]
                        });
                    }
                }
            });
        }
    });
}

module.exports = {
    sendLiveNotification,
    setClient
}