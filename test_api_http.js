const http = require('http');
const jwt = require('jsonwebtoken');

const user_id = 40;
const secret = 'hayaltamrat@27';
const token = jwt.sign({ user_id }, secret);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/my-plans-history',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        if (res.statusCode === 200) {
            const json = JSON.parse(data);
            console.log("Success:", json.success);
            console.log("Plans count:", json.plans?.length);
            console.log("TOTAL from API:", json.total);
            if (json.plans?.length > 0) {
                console.log("First plan structure:", JSON.stringify(json.plans[0], null, 2));
            }
        } else {
            console.error(`Status: ${res.statusCode}`, data);
        }
        process.exit();
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
});

req.end();
