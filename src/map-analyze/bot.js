const teeworlds = require('teeworlds');
const { initializeLogger, logMessage } = require('./logger');

const ip = process.argv[2];
const port = parseInt(process.argv[3], 10);
const serverName = process.argv[4];

initializeLogger(serverName, ip, port);

let previousMap = null;
const reconnectInterval = 5000;
let client;

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

let isConnected = false; // Variável para rastrear se o bot está conectado

function setupEventListeners() {
    client.on("connected", async () => {
        if (!isConnected) { // Verifica se já está conectado
            console.log(`Connected: ${ip}:${port}`);
            await logMessage(`Connected: ${ip}:${port}`);
            isConnected = true; // Atualiza o estado para conectado
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
        isConnected = false; // Atualiza o estado para desconectado
        setTimeout(reconnect, reconnectInterval);
    });
}

async function reconnect() {
    client.removeAllListeners();
    console.log(`Attempting to reconnect... ${ip}:${port}`);
    await connectClient();
}

async function connectClient() {
    try {
        await client.connect();
        console.log(`Connected: ${ip}:${port}`);
        await logMessage(`New: ${ip}:${port}`);
    } catch (error) {
        console.error(`Failed to connect: ${error.message}`);
        setTimeout(reconnect, reconnectInterval);
    }
}

process.on("SIGINT", async () => {
    console.log(`Shutting down bot... ${ip}:${port}`);
    if (client && typeof client.Disconnect === 'function') {
        await client.Disconnect(); // Tente desconectar corretamente
    }
    // Adicione um tempo limite para aguardar o término
    setTimeout(() => {
        console.log("Bot has been shut down.");
        process.exit(0);
    }, 1000); // Aguarde 1 segundo antes de forçar a saída
});


createClient();
connectClient();
