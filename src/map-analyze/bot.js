const teeworlds = require('teeworlds');
const { logMessage } = require('../logger');

let client = new teeworlds.Client("26.200.146.224", 8303, "name", {
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

client.on("map_details", (message) => {
    previousMap = message.map_name;
    console.log("map:", previousMap);
});

client.on("map_details", (message) => {
    const currentMap = message.map_name;

    if (currentMap !== previousMap) {
        console.log("Map changed to:", currentMap);
        logMessage(`Map changed to: ${currentMap}`);
        previousMap = currentMap;
    }
});


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
