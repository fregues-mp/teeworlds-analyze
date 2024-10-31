const fs = require('fs'); 
const path = require('path'); 

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

function formatDate(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleString('en-GB', options).replace(/[/,:]/g, '-');
}

const logFileName = `log-${formatDate(new Date())}.txt`;
const logFilePath = path.join(logsDir, logFileName);

async function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    await fs.promises.appendFile(logFilePath, logEntry);
}

module.exports = { logMessage };
