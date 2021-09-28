var {
  pubsub,
  withFilter,
} = require('../pubsubs');

const CHANNEL_ADDED_TOPIC = 'newChannel';

const channels = [{
  id: 1,
  name: 'soccer',
}, {
  id: 2,
  name: 'baseball',
}];

let nextId = 3;

const resolvers = {
  Query: {
    channels: () => {
      return channels;
    },
    channel: (root, {
      id
    }) => {
      return channels.find(channel => channel.id == id);
    },
  },
  Mutation: {
    addChannel: (root, args, context) => {
      // console.log(context.req.isAuth);
      const newChannel = {
        id: nextId++,
        name: args.name
      };
      channels.push(newChannel);
      pubsub.publish('channelAdded', {
        channelAdded: newChannel
      }); // publish to a topic
      return newChannel;
    },
  },
  Subscription: {
    channelAdded: {
      resolve: (payload, args, context, info) => {
        // Manipulate and return the new value
        // console.log(context);
        return payload.channelAdded;
      },
      subscribe: withFilter(
        (q, qw, qwe, qwer) => {
          // console.log(qwer);
          return pubsub.asyncIterator('channelAdded');
        },
        (payload, variables) => {
          // console.log("new load");
          // console.log(payload.channelAdded.name);
          // console.log(variables.name);
          // Only push an update if the comment is on
          // the correct repository for this operation
          return payload.channelAdded.name == variables.name;
        },
      ),
    },
  }
};


module.exports = {
  resolvers
}