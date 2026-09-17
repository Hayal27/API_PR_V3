const net = require('net');

console.log('Testing TCP connection to 127.0.0.1:3306...');
const socket = net.createConnection({ host: '127.0.0.1', port: 3306 }, () => {
    console.log('✅ TCP Socket connected to 127.0.0.1:3306!');
});

socket.on('data', (data) => {
    console.log('Received data from MySQL server (handshake greeting):', data.toString('utf8', 5, 50));
    socket.end();
});

socket.on('error', (err) => {
    console.error('❌ TCP Socket error:', err.message);
});

socket.setTimeout(5000, () => {
    console.error('❌ TCP Socket timeout (no greeting received in 5s)');
    socket.destroy();
});
