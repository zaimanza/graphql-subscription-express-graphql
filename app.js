var {
    pubsub,
    withFilter,
} = require('./pubsubs');
const CHANNEL_ADDED_TOPIC = 'newChannel';

const express = require('express');
const cors = require('cors');
const {
    graphqlExpress,
    graphiqlExpress,
} = require('apollo-server-express');
const bodyParser = require('body-parser');
const os = require('os');

const {
    execute,
    subscribe,
    buildSchema
} = require('graphql');
const {
    createServer
} = require('http');
const ws = require('ws');
const {
    useServer
} = require('graphql-ws/lib/use/ws');
const {
    SubscriptionServer
} = require('subscriptions-transport-ws');
const {
    graphqlHTTP
} = require("express-graphql");
const {
    schema
} = require('./src/schema');
require("dotenv").config();
const rootAuth = require("./rootAuth");
const PORT = process.env.PORT || 4000;

const checkHost = (hostPort) => {
    if (hostPort) {
        return 'hdmerchantbackend.herokuapp.com';
    }
    return `localhost:${PORT}`;
}

const url = checkHost(process.env.PORT);

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(rootAuth);

app.use(
    "/graphql",
    (req, res) => {
        graphqlHTTP({
            schema,
            graphiql: true,
            context: {
                req,
                res,
                // errorName,
                pubsub: pubsub,
            },
        })(req, res);
    });

app.use(
    '/graphiql',
    graphiqlExpress({
        endpointURL: '/graphql',
        subscriptionsEndpoint: `ws://${url}/subscriptions`
    })
);

const server = createServer(app);
server.listen(PORT, () => {
    console.log(`GraphQL Server is now running on http://${url}/graphiql`);

    // Set up the WebSocket for handling GraphQL subscriptions.
    // new SubscriptionServer({
    //     execute,
    //     subscribe,
    //     schema,
    //     onConnect: () => console.log("Client connected!")
    // }, {
    //     server: server,
    //     path: '/subscriptions',
    // });

    const wsServer = new ws.Server({
        server: server,
        path: '/graphql',
    });

    useServer({
        execute,
        subscribe,
        schema,
    }, wsServer);
});