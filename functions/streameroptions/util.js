const mysql = require('mysql');
const database = require('../../functions/streameroptions/sql');

/**
 * Gets the display name of a user
 * @param {String} username username of the user to get the display name of
 * @returns {Promise<void>}
 */
async function getProfileInfo(username) {
    return new Promise((resolve, reject) => {
        const con = mysql.createConnection(database.getDatabaseCredentials(false));
        con.connect();
        con.query(
            `SELECT userDisplayname FROM users WHERE userUsername = ?`,
            [username],
            (err, rows) => {
                con.end();
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve({
                        userid: rows[0].userId,
                        username: rows[0].userUsername,
                        displayname: rows[0].userDisplayname,
                        userImageUrl: rows[0].userProfileImageUrl,
                    });
                }
            }
        );
    });
}

/**
 * Gets the display name of a user
 * @param {Number} userid userid of the user to get the display name of
 * @returns {String} display name of the user
 */
async function getProfileInfoByID(userid) {
    return new Promise((resolve, reject) => {
        const con = mysql.createConnection(database.getDatabaseCredentials(false));
        con.connect();
        con.query(
            `SELECT userDisplayname FROM users WHERE userId = ?`,
            [userid],
            (err, rows) => {
                con.end();
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve({
                        userid: rows[0].userId,
                        username: rows[0].userUsername,
                        displayname: rows[0].userDisplayname,
                        userImageUrl: rows[0].userProfileImageUrl,
                    });
                }
            }
        );
    });
}

module.exports = {
    getProfileInfo,
    getProfileInfoByID,
}