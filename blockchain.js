const Web3 = require("web3");

const SportEventRegistry = require("./abi/SportEventRegistry.json");

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.PROVIDER_WEBSOCKET_URL));

exports.setupListeners = () => {
    const sportEventRegistry = new web3.eth.Contract(SportEventRegistry.abi, SportEventRegistry.address);

    let options = {
        filter: {
            value: []
        },
        fromBlock: 0
    };

    // SportEventCreated listener
    sportEventRegistry.events
        .SportEventCreated(options)
        .on("data", (event) => console.log(event))
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));

    // TicketsSold listener
    sportEventRegistry.events
        .TicketsSold(options)
        .on("data", (event) => console.log(event))
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));

    console.log("Listeners are setup!");
};
