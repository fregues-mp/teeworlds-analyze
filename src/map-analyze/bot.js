const teeworlds = require('teeworlds');
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
            "name": "πeis map bot",
            "clan": "πeis ∲",
            "skin": "santa_psychowolfe'",
            "use_custom_color": 1,
            "color_body": 13631488,
            "color_feet": 14090240,
            "country": -1,
        }
    });

    clients.push(client);
    setupEventListeners(client);
}

let isConnected = false;
let isShuttingDown = false;

function setupEventListeners(client) {
    client.on("connected", async () => {
        if (!isConnected) {
            console.log(`Connected: ${ip}:${port}`);
            await logMessage(`Connected: ${ip}:${port}`);
            isConnected = true;
        }
        client.game.SetTeam(-1);
    });

    client.on("map_details", async (message) => {
        const currentMap = message.map_name;

        if (currentMap && currentMap !== previousMap) {
            console.log(`Map changed to: ${currentMap} on ${ip}:${port}`);
            await logMessage(`Map changed to: ${currentMap}`);
            previousMap = currentMap;
        }
    });

    client.on("disconnect", async (reason) => {
        console.log(`Disconnected: ${reason} from ${ip}:${port}`);
        await logMessage(`Disconnected: ${reason}`);
        isConnected = false;
        
        if (!isShuttingDown) {
            setTimeout(reconnect(client), reconnectInterval);
        }
    });
}

async function reconnect(client) {
    client.removeAllListeners();
    console.log(`Attempting to reconnect... ${ip}:${port}`);
    await connectClient(client);
}

async function connectClient(client) {
    try {
        await client.connect();
        console.log(`Connected: ${ip}:${port}`);
        await logMessage(`New: ${ip}:${port}`);
    } catch (error) {
        console.error(`Failed to connect: ${error.message}`);
        setTimeout(() => reconnect(client), reconnectInterval);
    }
}

process.on("SIGINT", async () => {
    console.log(`Shutting down bot... ${ip}:${port}`);
    isShuttingDown = true;

    for (const client of clients) {
        try {
            if (client && typeof client.Disconnect === 'function') {
                await client.Disconnect();
                console.log(`Disconnected from ${ip}:${port}`);
            }
        } catch (error) {
            console.error(`Error during disconnection: ${error.message}`);
        }
    }

    setTimeout(() => {
        console.log("Bot has been shut down.");
        process.exit(0);
    }, 1000);
});

createClient();
connectClient(clients[clients.length - 1]);
