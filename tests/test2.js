const teeworlds = require('teeworlds');
const { logMessage } = require('../src/logger');

let client = new teeworlds.Client("26.200.146.224", 8303, "name", {
    identity: {
        "name": "πeis bot",
        "clan": "πeis ∲",
        "skin": "santa_psychowolfe'",
        "use_custom_color": 1,
        "color_body": 13631488,
        "color_feet": 14090240,
        "country": -1,
    }
});

let previousMap = null;

client.connect().catch((error) => {
    console.error("Failed to connect:", error);
    logMessage(`Failed to connect: ${error.message}`);
    process.exit(1);
});

client.on("connected", async () => {
    console.log("Connected!");
    await logMessage("Connected!");
    client.game.SetTeam(-1);
});

client.on("message", async (message) => {
    const messageText = message.toString();
    console.log("Message from server:", messageText);

    if (messageText.includes("flushing")) {
        const currentMap = getCurrentMap(); // Função para obter o mapa atual

        if (currentMap && currentMap !== previousMap) {
            console.log("Map changed to:", currentMap);
            await logMessage(`Map changed to: ${currentMap}`);
            previousMap = currentMap;
        }
    }
});

// Função de exemplo para obter o nome do mapa atual
function getCurrentMap() {
    // Retorne o nome do mapa aqui, caso a biblioteca tenha suporte para isso
    return "example_map"; // Substitua pela função que obtém o nome real do mapa
}

client.on("disconnect", async (reason) => {
    console.log("Disconnected: " + reason);
    await logMessage(`Disconnected: ${reason}`);
});

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
