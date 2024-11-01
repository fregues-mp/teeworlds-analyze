const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, 'servers.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

function startBot(ip, port) {
    const botScript = path.join(__dirname, 'bot.js');
    const botProcess = fork(botScript, [ip, port]);

    botProcess.on('message', (message) => {
        console.log(`Bot [${ip}:${port}] - ${message}`);
    });

    botProcess.on('exit', (code) => {
        console.log(`Bot [${ip}:${port}] exited with code ${code}`);
    });
}

config.servers.forEach(server => {
    server.ports.forEach(port => {
        startBot(server.ip, port);
    });
});
