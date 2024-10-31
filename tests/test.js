const teeworlds = require('teeworlds');
const { logMessage } = require('./logger');

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
    console.log("Message from server:", message); 
    await logMessage(`Message from server: ${JSON.stringify(message)}`);
});

client.on("kill", async (message) => {
    console.log("Kill event:", message);
    await logMessage(`Kill event: ${JSON.stringify(message)}`);
});

client.on("disconnect", async (message) => {
    console.log("Disconnected: ", message);
    await logMessage(`Disconnected: ${JSON.stringify(message)}`);
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
