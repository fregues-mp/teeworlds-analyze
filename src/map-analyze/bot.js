const teeworlds = require('teeworlds');
const { logMessage } = require('../logger');

let client;
let previousMap = null;
const reconnectInterval = 5000;
const ip = 26.200.146.224;
const port = 8303;

function createClient() {
    client = new teeworlds.Client(ip, port, "name", {
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

    setupEventListeners();
}

function connectClient() {
    client.connect().catch((error) => {
        console.error("Failed to connect:", error);
        logMessage(`Failed to connect: ${error.message}`);
        setTimeout(connectClient, reconnectInterval);
    });
}

function setupEventListeners() {
    client.on("connected", async () => {
        console.log(`Connected: ${ip}:${port}`);
        await logMessage(`Connected: ${ip}:${port}`);
        client.game.SetTeam(-1);
    });

    client.on("map_details", async (message) => {
        const currentMap = message.map_name;

        if (currentMap !== previousMap) {
            console.log("Map changed to:", currentMap);
            await logMessage(`Map changed to: ${currentMap}`);
            previousMap = currentMap;
        }
    });

    client.on("disconnect", async (reason) => {
        console.log("Disconnected: " + reason);
        await logMessage(`Disconnected: ${reason}`);
        setTimeout(() => {
            console.log("Attempting to reconnect...");
            reconnect();
        }, reconnectInterval);
    });
}

function reconnect() {
    createClient();
    connectClient();
}

process.stdin.on("data", async (data) => {
    const command = data.toString().trim();
    if (command === 'quit') {
        await client.Disconnect();
        console.log("Disconnected from server.");
        await logMessage("Disconnected from server.");
        process.exit(0);
    } else {
        client.game.Say(command);
    }
});

createClient();
connectClient();
