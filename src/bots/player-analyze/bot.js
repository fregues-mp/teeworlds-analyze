const teeworlds = require('teeworlds');
const config = require('../../config/bot-identify.json');
const { initializeLogger, logMessage } = require('./logger');

const ip = process.argv[2];
const port = parseInt(process.argv[3], 10);
const serverName = process.argv[4];

initializeLogger(serverName, ip, port);

let previousMap = null;
const reconnectInterval = 5000;
let clients = [];

function createClient() {
    const client = new teeworlds.Client(ip, port, "name", {
        identity: {
            "name": config["player-analyze"].name,
            "clan": config["player-analyze"].clan,
            "skin": config["player-analyze"].skin,
            "use_custom_color": config["player-analyze"].use_custom_color,
            "color_body": config["player-analyze"].color_body,
            "color_feet": config["player-analyze"].color_feet,
            "country": config["player-analyze"].country,
        }
    });

    clients.push(client);
    setupEventListeners(client);
}

let isConnected = false;
let isShuttingDown = false;

function setupEventListeners(client) {
    client.on("connected", async () => {
        isConnected = true;
        client.game.SetTeam(-1);
    });

    client.on("message", (msg) => {
        const joinMatch = msg.message.match(/'(.+?)' entered and joined the game/);
        if (joinMatch) {
            const playerName = joinMatch[1];
            console.log(`Player entered: "${playerName}" from ${ip}:${port} ${serverName}`);
            logMessage(`Player entered, Name: "${playerName}" from ${ip}:${port} ${serverName}`);
        }
   
        if (msg.message.toLowerCase().includes("player-analyze")) {
            const playerName = msg.author?.ClientInfo?.name;
            const autoReplyMessage = `/w ${playerName} Hi, I'm analyzing some game data, for more information check out my Github: https://github.com/fregues-mp/teeworlds-analyze`;
            console.log(`Replied to "${playerName}" from ${ip}:${port} ${serverName}`);
            logMessage(`Replied to "${playerName}"`);
            client.game.Say(autoReplyMessage);
        }
    });

    client.on("disconnect", async (reason) => {
        console.log(`Disconnected: ${reason} from ${ip}:${port} ${serverName}`);
        isConnected = false;
        
        if (!isShuttingDown) {
            setTimeout(() => reconnect(client), reconnectInterval);
        }
    });
}

async function reconnect(client) {
    client.removeAllListeners();
    console.log(`Attempting to reconnect... ${ip}:${port} ${serverName}`);
    await connectClient(client);
}

async function connectClient(client) {
    try {
        await client.connect();
    } catch (error) {
        console.error(`Failed to connect: ${error.message}`);
        setTimeout(() => reconnect(client), reconnectInterval);
    }
}

process.on("SIGINT", async () => {
    console.log(`Shutting down bot... ${ip}:${port} ${serverName}`);
    isShuttingDown = true;

    const maxAttempts = 10;
    let attempts = 0;

    const disconnectClients = async () => {
        for (const client of clients) {
            try {
                if (client && typeof client.Disconnect === 'function') {
                    await client.Disconnect();
                    console.log(`Disconnected from ${ip}:${port} ${serverName}`);
                }
            } catch (error) {
                console.error(`Error during disconnection: ${error.message}`);
            }
        }

        attempts++;

        if (attempts < maxAttempts) {
            setTimeout(disconnectClients, 250);
        } else {
            console.log("Bot has been shut down.");
            process.exit(0);
        }
    };

    disconnectClients();
});

createClient();
connectClient(clients[clients.length - 1]);
