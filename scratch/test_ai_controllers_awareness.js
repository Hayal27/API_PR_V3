const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'hayaltamrat@27';

async function testAwareness() {
  const token = jwt.sign({ user_id: 83, role_id: 7 }, JWT_SECRET, { expiresIn: '1h' });

  console.log('Testing AI awareness of all controllers and APIs...');

  try {
    const res = await axios.post('http://127.0.0.1:5001/api/ai/chat-with-ai', {
      messages: [
        { 
          role: 'user', 
          content: 'Can you explain how goalConfigController handles quarterly activations, how taskBreakdownController decomposes KPIs into monthly/weekly tasks, and how meetingController manages Zoom meetings?' 
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 35000
    });

    console.log('\n--- AI RESPONSE ON CONTROLLERS & APIS ---');
    console.log(res.data.reply);
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message);
  }
  process.exit(0);
}

testAwareness();
