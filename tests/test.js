const teeworlds = require('teeworlds');

let client = new teeworlds.Client("26.200.146.224", 8303, "name", {
    identity: {
        "name": "πeis bot",
        "clan": "πeis ∲",
        "skin": "santa_psychowolfe",
        "use_custom_color": 1,
        "color_body": 13631488,
        "color_feet": 14090240,
        "country": -1,
    }
});

client.connect().catch((error) => {
    console.error("Failed to connect:", error);
    process.exit(1);
});

client.on("connected", async () => {
    console.log("Connected!");
});

client.on("message", async (message) => {
    console.log("Message from server:", message); 
});

client.on("kill", async (message) => {
    console.log("Kill event:", message);
});

client.on("disconnect", async (message) => {
    console.log("Disconnected: ", message);
});

process.on("SIGINT", async () => {
    console.log("Shutting down bot...");
    isShuttingDown = true;

    const maxAttempts = 10;
    let attempts = 0;

    const disconnectClients = async () => {
        for (const client of clients) {
            try {
                if (client && typeof client.Disconnect === 'function') {
                    await client.Disconnect();
                    console.log("Disconnected");
                }
            } catch (error) {
                console.error(`Error during disconnection: ${error.message}`);
            }
        }

        attempts++;

        if (attempts < maxAttempts) {
            setTimeout(disconnectClients, 1000);
        } else {
            console.log("Bot has been shut down.");
            process.exit(0);
        }
    };

    disconnectClients();
});
