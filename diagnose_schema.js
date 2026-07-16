const mysql = require('mysql');
const fs = require('fs');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'itpr'
};

const connection = mysql.createConnection(dbConfig);
const logFile = 'schema_diagnosis.log';

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}

async function checkSchema(table) {
    return new Promise((resolve, reject) => {
        connection.query(`DESCRIBE \`${table}\``, (error, results) => {
            if (error) reject(error);
            else {
                log(`--- Schema for ${table} ---`);
                log(JSON.stringify(results, null, 2));
                resolve();
            }
        });
    });
}

async function run() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    connection.connect();
    try {
        await checkSchema('goals');
        await checkSchema('objectives');
        await checkSchema('specific_objectives');
        await checkSchema('specific_objective_details');
        await checkSchema('plans');
        await checkSchema('approvalworkflow');
    } catch (e) {
        log('Error: ' + e.message);
    } finally {
        connection.end();
    }
}

run();
