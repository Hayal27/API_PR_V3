const axios = require('axios');

const BASE_URL = 'http://192.168.0.223:5001/api';
const TOKEN = 'YOUR_TOKEN_HERE'; // Note: This script is for logical verification of the URL structure

async function testFilter(params) {
    try {
        console.log(`Testing with params: ${JSON.stringify(params)}`);
        const response = await axios.get(`${BASE_URL}/getDetailedFullReporting`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
            params: params
        });
        console.log(`Results: ${response.data.length} records found`);
        if (response.data.length > 0) {
            console.log('Sample Record:', JSON.stringify(response.data[0], null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// In a real environment, I would run this if I had a valid token.
// Since I'm an agent, I'll rely on my code analysis and the user's manual validation if needed.
console.log('Test Script Prepared for Manual Execution if required.');
