const axios = require('axios');
const jwt = require('jsonwebtoken');

// Generate test JWT tokens for user_id = 83 (Lelisa Gemechu, Section Head)
const JWT_SECRET = 'hayaltamrat@27';

async function runTests() {
  const token = jwt.sign({ user_id: 83, role_id: 7 }, JWT_SECRET, { expiresIn: '1h' });

  console.log('Testing Live Backend: http://127.0.0.1:5001/api/ai/chat-with-ai');

  // Test 1: Daily Tasks Query for Lelisa Gemechu (Supervisor)
  try {
    const res1 = await axios.post('http://127.0.0.1:5001/api/ai/chat-with-ai', {
      messages: [
        { role: 'user', content: 'what tasks I do have for today' }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000
    });

    console.log('\n--- TEST 1 SUCCESS: Supervisor Task Query ---');
    console.log(res1.data.reply);
  } catch (err) {
    console.error('Test 1 failed:', err.response?.data || err.message);
  }

  // Test 2: System controls & pages navigation query
  try {
    const res2 = await axios.post('http://127.0.0.1:5001/api/ai/chat-with-ai', {
      messages: [
        { role: 'user', content: 'where can I assign a task to my subordinates and where can I view organizational structure?' }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000
    });

    console.log('\n--- TEST 2 SUCCESS: Navigation & Controls Query ---');
    console.log(res2.data.reply);
  } catch (err) {
    console.error('Test 2 failed:', err.response?.data || err.message);
  }

  process.exit(0);
}

runTests();
