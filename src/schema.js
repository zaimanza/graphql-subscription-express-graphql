const {
  makeExecutableSchema
} = require('@graphql-tools/schema');
const {
  gql,
} = require('apollo-server-express');

const {
  resolvers
} = require('./resolvers');

const typeDefs = gql`
    type Channel {
      id: ID!               
      name: String
      messages: [Message]!
    }

    type Message {
      id: ID!
      text: String
    }
    type Query {
      channels: [Channel]    
      channel(id: ID!): Channel
    }

    type Mutation {
      addChannel(name: String!): Channel
    }
     
    type Subscription {
      channelAdded(name:String!): Channel    # subscription operation.
    }

  `;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
module.exports = {
  schema
};