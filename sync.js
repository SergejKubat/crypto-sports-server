const Web3 = require("web3");

const Event = require("./schemas/Event");
const Ticket = require("./schemas/Ticket");

const SportEventRegistry = require("./abi/SportEventRegistry.json");

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.PROVIDER_WEBSOCKET_URL));

exports.setupListeners = async () => {
    const sportEventRegistry = new web3.eth.Contract(SportEventRegistry.abi, SportEventRegistry.address);

    let options = {
        filter: {
            value: []
        },
        fromBlock: "latest"
    };

    // SportEventCreated listener
    sportEventRegistry.events
        .SportEventCreated(options)
        .on("data", async (event) => {
            // add Sport Event contract address
            const sportEventName = event.returnValues.name;
            const sportEventAddress = event.returnValues.sportEventAddress;

            const sportEvent = await Event.findOne({ name: sportEventName }).exec();

            sportEvent.contractAddress = sportEventAddress;
            sportEvent.status = "published";

            await sportEvent.save();

            console.log(`Sync is successful for event: ${sportEvent.name}`);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err, receipt) => console.log("Error: ", err, receipt))
        .on("connected", (subscriptionId) => console.log("Subscription ID: ", subscriptionId));

    // TicketsSold listener
    sportEventRegistry.events
        .TicketsSold(options)
        .on("data", async (event) => {
            // add tickets to database
            const sportEventAddress = event.returnValues.sportEventAddress;
            const owner = event.returnValues.to;
            const ticketTypes = event.returnValues.ticketTypes;

            let startId = parseInt(event.returnValues.startId);

            const sportEvent = await Event.findOne({ contractAddress: sportEventAddress }).exec();

            const tickets = [];

            for (let i = 0; i < ticketTypes.length; i++) {
                tickets.push({
                    tokenId: startId,
                    type: parseInt(ticketTypes[i]),
                    owner: owner,
                    eventAddress: sportEventAddress,
                    event: sportEvent.id
                });

                startId++;
            }

            await Ticket.insertMany(tickets);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err, receipt) => console.log("Error: ", err, receipt))
        .on("connected", (subscriptionId) => console.log("Subscription ID: ", subscriptionId));
};
