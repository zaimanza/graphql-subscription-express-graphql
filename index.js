const {
    createServer
} = require('http');
const bodyParser = require("body-parser");
const cors = require("cors");

const express = require('express');
const {
    execute,
    subscribe
} = require('graphql');
const {
    graphqlExpress,
    graphiqlExpress,
} = require('apollo-server-express');
const {
    SubscriptionServer
} = require('subscriptions-transport-ws');
const {
    PubSub
} = require('graphql-subscriptions');
const pubsub = new PubSub(); //create a PubSub instance

const {
    graphqlHTTP
} = require('express-graphql');

const {
    schema,
    rootValue
} = require('./schema');

const PORT = 4000;
const subscriptionEndpoint = `ws://localhost:${PORT}/subscriptions`;

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: true,
    credentials: true
}));

// app.use(
//     "/graphql",
//     (req, res) => {
//         graphqlHTTP({
//             schema,
//             rootValue,
//             graphiql: {
//                 endpointURL: '/graphql',
//                 subscriptionEndpoint: subscriptionEndpoint,
//             },
//         })(req, res);
//     });

app.use(
    '/graphql',
    (req, res) => {
        graphqlExpress({
            schema,
            rootValue,
        })(req, res);
    }
);

app.use(
    '/graphiql',
    graphiqlExpress({
        endpointURL: '/graphql',
        subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
    })
);

const server = createServer(app);

server.listen(PORT, () => {

    new SubscriptionServer({
        schema,
        rootValue,
        execute,
        subscribe,
        onConnect: (_, __) => console.log("Client connected!"),
        onDisconnect: (_, __) => console.log("Client disconnet!"),
    }, {
        server: server,
        path: '/subscriptions',
    });

    console.log(
        `Running a GraphQL API server with subscriptions at http://localhost:${PORT}/graphiql`,
    );
});