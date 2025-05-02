const { WebSocket } = require('ws');
const { SocketIP, SocketPort, SocketSecret, SocketKey } = require('../../config.json');
const crypto = require('crypto');
const streamerLiveNotification = require('./streamerLiveNotification');

let ws;

const key = "8E0B3F6C9E1A4D793CA9346C9E1A4D7C";

async function init() {
    ws = new WebSocket(process.env.WEBSOCKET_URL);
    console.info('Connected to websocket server.');
    ws.on('error', () => {});

    ws.on('message', (data) => {
        handleIncoming(data.toString());
    });

    ws.on('close', () => {
        init();
    });

}

const iv = Buffer.alloc(16, 0)

function encrypt(message) {
    const cipher = crypto.createCipheriv('aes256', key, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex')
    return encrypted
}

function decrypt(encryptedMessage) {
    try {
        const decipher = crypto.createDecipheriv('aes256', key, iv);
        let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (ex) {
        return null;
    }
}

async function send(message) {
    const encryptedMessage = encrypt(message);
    ws.send(encryptedMessage);
}

async function handleIncoming(data) {
    const message = decrypt(data);
    if(message === null) return;
    //console.log('incoming: ' + message);
    let messageObject;
    try {
        messageObject = JSON.parse(message);
    } catch (ex) {
        return;
    }
    if(messageObject.type === 'liveNotification') {
        streamerLiveNotification.sendLiveNotification(messageObject.data);
    }
}

module.exports = {
    init,
    send,
}