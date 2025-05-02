const mysql = require('mysql');
const database = require('../../functions/streameroptions/sql');

/**
 * Gets the autocomplete for streamer names from the database
 * @param {String} name - name of the streamer to get the autocomplete for
 * @returns {Promise<Array<{ name: string, value: string }>>} - array of autocomplete choices
 */
async function getStreamerAutocomplete(name) {
    return new Promise((resolve, reject) => {
        const con = mysql.createConnection(database.getDatabaseCredentials(false));
        con.connect();
        con.query(
            `SELECT userUsername, userDisplayname FROM streamer JOIN users ON streamerUserId = userId WHERE userUsername LIKE ? LIMIT 25`,
            [`%${name}%`],
            (err, rows) => {
                con.end();
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    const choices = rows.map((row) => ({
                        name: row.userDisplayname,
                        value: row.userUsername,
                    }));
                    resolve(choices);
                }
            }
        );
    });
}

module.exports = {
    getStreamerAutocomplete,
};