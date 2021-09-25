const {
    buildSchema
} = require('graphql');
const {
    execute,
    subscribe
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
    Subscription: {
        channelAdded: {  // create a channelAdded subscription resolver function.
            subscribe: () => pubsub.asyncIterator('channelAdded')  // subscribe to changes in a topic
        }
    }
};

exports.roots = roots;

exports.rootValue = {
    hello: roots.Query.hello,
    channelAdded: roots.Subscription.channelAdded,
};