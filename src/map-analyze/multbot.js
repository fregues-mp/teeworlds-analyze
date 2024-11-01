const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

// Lê o arquivo de configuração
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Função para iniciar um bot em um IP e porta específicos
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

// Loop para iniciar o bot para cada IP e porta no arquivo de configuração
config.servers.forEach(server => {
    server.ports.forEach(port => {
        startBot(server.ip, port);
    });
});
