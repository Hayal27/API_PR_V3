const axios = require('axios');
const jwt = require('jsonwebtoken');

const user_id = 40;
const secret = 'hayaltamrat@27';
const token = jwt.sign({ user_id }, secret);

async function testFetchPlans() {
    try {
        const response = await axios.get('http://192.168.0.223:5001/api/getplan', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", response.data.success);
        console.log("Plans count:", response.data.plans?.length);
        if (response.data.plans?.length > 0) {
            console.log("First plan example:", JSON.stringify(response.data.plans[0], null, 2));
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

testFetchPlans();
