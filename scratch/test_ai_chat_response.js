const aiController = require('../controllers/aiController');

async function runTest() {
  const req = {
    user_id: 83, // Lelisa Gemechu (Section Head)
    body: {
      messages: [
        { role: 'user', content: 'what tasks I do have for today' }
      ]
    }
  };

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log('--- Response Status:', this.statusCode);
      console.log('--- AI Reply ---:');
      console.log(data.reply);
      process.exit(0);
    }
  };

  await aiController.chatWithAI(req, res);
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
