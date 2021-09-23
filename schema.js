const {
    buildSchema
} = require('graphql');

const {
    PubSub
} = require('graphql-subscriptions');
const pubsub = new PubSub(); //create a PubSub instance

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const schema = buildSchema(`
type Query {
    hello: String
}
type Subscription {
    channelAdded: String  
    # countDown: Int
}
`);
exports.schema = schema;

const roots = {
    Query: {
        hello: () => {

            pubsub.publish('channelAdded', {
                channelAdded: "hello"
            });

            return "hello world!";
        },
    },
    subscription: {
        /* eslint no-await-in-loop: "off" */
        channelAdded: { // create a channelAdded subscription resolver function.
            subscribe: () => pubsub.asyncIterator('channelAdded') // subscribe to changes in a topic
        }

        // countDown: async function* fiveToOne() {
        //     for (const number of [5, 4, 3, 2, 1]) {
        //         await sleep(1000); // slow down a bit so user can see the count down on GraphiQL
        //         yield {
        //             countDown: number
        //         };
        //     }
        // },
    },
};

exports.roots = roots;

exports.rootValue = {
    hello: roots.Query.hello,
    countDown: roots.subscription.countDown,
};