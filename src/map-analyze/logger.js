const fs = require('fs'); 
const path = require('path'); 

let logFilePath = null;

function initializeLogger(serverName, ip, port) {
    const logsDir = path.join(__dirname, 'logs', serverName); // Cria pasta para cada servidor
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true }); // Cria a pasta se não existir
    }
    const logFileName = `log-${ip}-${port}.txt`;
    logFilePath = path.join(logsDir, logFileName);
}

async function logMessage(message) {
    if (!logFilePath) {
        throw new Error("Logger not initialized. Call initializeLogger(serverName, ip, port) first.");
    }
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    await fs.promises.appendFile(logFilePath, logEntry);
}

module.exports = { initializeLogger, logMessage };
