require('dotenv').config({ path: '.env' });

/**
 * Returns the database credentials as a object
 * @param {boolean} multipleStatements - Whether or not to allow multiple statements in a query
 * @returns {object} - The database credentials
 */
function getDatabaseCredentials(multipleStatements) {
    return {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER ,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DB,
        multipleStatements: multipleStatements ? true : false
    }
}


module.exports = {
    getDatabaseCredentials: getDatabaseCredentials,
}