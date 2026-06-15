export const treatTypeDefs = `#graphql
  enum TreatStatus {
    PENDING
    COMPLETED
  }

  type Treat {
    id: ID!
    description: String!
    reason: String
    status: TreatStatus!
    ower: User!
    addedBy: User!
    group: Group!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    groupTreats(groupId: ID!): [Treat!]!
  }

  extend type Mutation {
    addTreat(groupId: ID!, description: String!, reason: String, owerId: ID!): Treat!
    completeTreat(id: ID!): Treat!
    deleteTreat(id: ID!): Boolean!
  }

  extend type Subscription {
    treatAdded(groupId: ID!): Treat!
    treatUpdated(groupId: ID!): Treat!
  }
`;
