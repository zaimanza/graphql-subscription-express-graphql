var {
    pubsub,
    withFilter,
} = require('./pubsubs');
const CHANNEL_ADDED_TOPIC = 'newChannel';
const {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
    ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

const express = require('express');
const cors = require('cors');
const {
    ApolloServer,
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
    schema,
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
    origin: '*',
    credentials: true,
}));
app.use(rootAuth);
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://studio.apollographql.com"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Headers"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, GET, PUT, PATCH, DELETE, OPTIONS, HEAD"
    );

    // Pass to next layer of middleware
    next();
});

var server = null;

async function startServer() {
    server = new ApolloServer({
        schema,
        introspection: true,
        playground: true,
        plugins: [
            // ApolloServerPluginLandingPageGraphQLPlayground(),
            {
                async serverLandingPage() {
                    if (process.env.NODE_ENV === 'production') {
                        return ApolloServerPluginLandingPageProductionDefault({
                            graphRef: "My-Graph-2-wtim1@current",
                            footer: false,
                        });
                    } else {
                        return ApolloServerPluginLandingPageLocalDefault({
                            footer: false
                        });
                    }
                }
            },
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        },
                    };
                },
            }
        ],
        context: ({
            req,
            res
        }) => ({
            req,
            res,
        }),
    });
    await server.start();
    server.applyMiddleware({
        app,
    });
}

startServer();

const httpServer = createServer(app);
const subscriptionServer = SubscriptionServer.create({
    // This is the `schema` we just created.
    schema,
    // These are imported from `graphql`.
    execute,
    subscribe,
    onConnect: () => console.log("Client connected!"),
}, {
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // This `server` is the instance returned from `new ApolloServer`.
    path: server.graphqlPath,
});

httpServer.listen({
    port: 4000
}, () =>
    console.log('Now browse to http://localhost:4000' + server.graphqlPath)
);

// app.use(
//     "/graphql",
//     (req, res) => {
//         graphqlHTTP({
//             schema,
//             graphiql: true,
//             context: {
//                 req,
//                 res,
//                 // errorName,
//                 pubsub: pubsub,
//             },
//         })(req, res);
//     });

// app.use(
//     '/graphiql',
//     graphiqlExpress({
//         endpointURL: '/graphql',
//         subscriptionsEndpoint: `ws://${url}/subscriptions`
//     })
// );

// const server = createServer(app);
// server.listen(PORT, () => {
//     console.log(`GraphQL Server is now running on http://${url}/graphiql`);

//     // Set up the WebSocket for handling GraphQL subscriptions.
//     // new SubscriptionServer({
//     //     execute,
//     //     subscribe,
//     //     schema,
//     //     onConnect: () => console.log("Client connected!")
//     // }, {
//     //     server: server,
//     //     path: '/subscriptions',
//     // });

//     // const wsServer = new ws.Server({
//     //     server: server,
//     //     path: '/graphql',
//     // });

//     // useServer({
//     //     execute,
//     //     subscribe,
//     //     schema,
//     // }, wsServer);
// });