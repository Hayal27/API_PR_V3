const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ user_id: 40 }, 'hayaltamrat@27');
const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/getplan',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
}, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        try {
            const j = JSON.parse(data);
            console.log(JSON.stringify(j.plans[0], null, 2));
        } catch (e) {
            console.error(e, data.substring(0, 100));
        }
        process.exit();
    });
});
req.on('error', console.error);
req.end();
