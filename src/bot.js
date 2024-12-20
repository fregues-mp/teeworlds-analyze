const colors = require('colors');
const teeworlds = require('teeworlds');
const config = require('./config/bot-identify.json');
const { initializeLogger, logMessage } = require('./logger');

const ip = process.argv[2];
const port = parseInt(process.argv[3], 10);
const serverName = process.argv[4];
const formattedAddress = colors.black.bgWhite(`${serverName} ${ip}:${String(port)} |`);

const reconnectInterval = 5000;

const originalWrite = process.stdout.write;
const customMessage = [formattedAddress, "| ENTERED: ".black.bgGray, "TRUE".green].join(" ");

process.stdout.write = function (message, ...args) {
  if (typeof message === 'string' && message.includes("flushing")) {
    return originalWrite.apply(process.stdout, [customMessage + '\n', ...args]);
  }

  return originalWrite.apply(process.stdout, [message, ...args]);
};
  

let callerName;
let mapName;
let reason;
let previousMap = null;
let clients = [];

initializeLogger(serverName, ip, port);

function createClient() {
    const client = new teeworlds.Client(ip, port, "name", {
        identity: {
            "name": config["default-analyze"].name,
            "clan": config["default-analyze"].clan,
            "skin": config["default-analyze"].skin,
            "use_custom_color": config["default-analyze"].use_custom_color,
            "color_body": config["default-analyze"].color_body,
            "color_feet": config["default-analyze"].color_feet,
            "country": config["default-analyze"].country,
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
        const playerName = msg.author?.ClientInfo?.name;
        const playerClan = msg.author?.ClientInfo?.clan || "N/A";
        const playerSkin = msg.author?.ClientInfo?.skin;
        const playerId = msg.author?.Client_id || -1;
        const autoReplie = "Hi, I'm analyzing some game data, for more information check out my Github: https://github.com/fregues-mp/teeworlds-analyze";
        
        const playerInfo = (` ${String(playerId)}: ${playerName} - ${playerClan} - ${playerSkin} |`);
    
        if (playerName !== undefined && msg.message !== autoReplie) {
            console.log(formattedAddress, "| MESSAGE: ".black.bgGray, playerInfo.yellow, msg.message);
            logMessage(`| MESSAGE: ${playerInfo}: ${msg.message}`);
    
            if (msg.message.match(config["default-analyze"].name) && playerName !== undefined) {
                const autoReplyMessage = `/w ${playerName} ${autoReplie}`;
                console.log(formattedAddress, `| REPLIED: `.black.bgGray, ` ${playerName} |`.yellow);
                logMessage(`| REPLIED: ${playerName}`);
                client.game.Say(autoReplyMessage);
            }
        }
        
        const joinMatchEnter = msg.message.match(/'(.+?)' entered and joined the game/);
        if (joinMatchEnter && playerName === undefined) {
            const playerName = joinMatchEnter[1];
            console.log(formattedAddress, "| JOINED: ".black.bgGray, ` ${playerName} |`.yellow);
            logMessage(`| JOINED: ${playerName} |`);
        }
        const joinMatchLeave = msg.message.match(/'(.+?)' has left the game/);
        if (joinMatchLeave && playerName === undefined) {
            const playerName = joinMatchLeave[1];
            console.log(formattedAddress, "| DROPPED: ".black.bgGray, ` ${playerName} |`.yellow);
            logMessage(`| DROPPED: ${playerName} |`);
        }

        const voteMatch = msg.message.match(/'(.+?)' called vote to change server option 'Map: (.+?)' \((.*?)\)/);
        if (voteMatch && playerName === undefined) {
            callerName = voteMatch[1];
            mapName = voteMatch[2];
            reason = voteMatch[3];
        
            console.log(formattedAddress, "| VOTE: ".black.bgGray, ` ${callerName} - ${mapName} - ${reason} |`.yellow);
            logMessage(`| VOTE: ${callerName} - ${mapName} - ${reason}`);
        }

        const votePassed = msg.message.match(/Vote passed/);
        if (votePassed && playerName === undefined) {
            console.log(formattedAddress, "| VOTE: ".black.bgGray, ` ${callerName} - ${mapName} - ${reason} |`.yellow, "TRUE".green);
            logMessage("| VOTE: ", ` ${callerName} - ${mapName} - ${reason} |`, "TRUE");
        }

        const voteFailed = msg.message.match(/Vote failed/);
        if (voteFailed && playerName === undefined) {
            console.log(formattedAddress, "| VOTE: ".black.bgGray, ` ${callerName} - ${mapName} - ${reason} |`.yellow, "FALSE".red);
            logMessage("| VOTE: ", ` ${callerName} - ${mapName} - ${reason} |`, "FALSE");
        }


    });

    client.on("map_details", async (message) => {
        const currentMap = message.map_name;
    
        if (currentMap && currentMap !== previousMap) {
            console.log(formattedAddress, "| MAP CHANGE: ".black.bgGray, ` ${currentMap} |`.yellow);
            await logMessage(`| MAP CHANGE: ${currentMap}`);
            previousMap = currentMap;
        }
    });
    
    client.on("disconnect", async (reason) => {
        isConnected = false;
        
        if (!isShuttingDown) {
            setTimeout(() => reconnect(client), reconnectInterval);
        }
    });
}

async function reconnect(client) {
    client.removeAllListeners();
    await connectClient(client);
}

async function connectClient(client) {
    try {
        await client.connect();
    } catch (error) {
        setTimeout(() => reconnect(client), reconnectInterval);
    }
}

process.on("SIGINT", async () => {
    isShuttingDown = true;

    const maxAttempts = 10;
    let attempts = 0;

    const disconnectClients = async () => {
        for (const client of clients) {
            try {
                if (client && typeof client.Disconnect === 'function') {
                    await client.Disconnect();
                    console.log(formattedAddress, "| DISCONNECTED: ".black.bgGray, "TRUE".green);
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

createClient();
connectClient(clients[clients.length - 1]);
