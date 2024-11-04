const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, './servers/MyServers.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

function startBot(server) {
    const { Name, ip, ports } = server;
    const botScript = path.join(__dirname, 'bot.js');
    
    ports.forEach(port => {
        const botProcess = fork(botScript, [ip, port, Name]);

        botProcess.on('message', (message) => {
            console.log(`Bot [${ip}:${port}] - ${message}`);
        });

        botProcess.on('exit', (code) => {
            console.log(`Bot [${ip}:${port}] exited with code ${code}`);
        });
    });
}

config.servers.forEach(server => {
    startBot(server);
});
