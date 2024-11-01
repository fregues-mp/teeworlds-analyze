const fs = require('fs'); 
const path = require('path'); 

let logFilePath = null;

function initializeLogger(ip, port) {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    const logFileName = `log-${ip}-${port}.txt`;
    logFilePath = path.join(logsDir, logFileName);
}

async function logMessage(message) {
    if (!logFilePath) {
        throw new Error("Logger not initialized. Call initializeLogger(ip, port) first.");
    }
    const logEntry = `${message}\n`;
    await fs.promises.appendFile(logFilePath, logEntry);
}

module.exports = { initializeLogger, logMessage };
