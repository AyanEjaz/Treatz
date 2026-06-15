export const fundTypeDefs = `#graphql
  type FundContribution {
    id: ID!
    amount: Float!
    note: String
    user: User!
    group: Group!
    createdAt: String!
  }

  type FundSummary {
    total: Float!
    contributions: [FundContribution!]!
  }

  extend type Query {
    groupFund(groupId: ID!): FundSummary!
  }

  extend type Mutation {
    contributeToFund(groupId: ID!, amount: Float!, note: String): FundContribution!
  }

  extend type Subscription {
    fundContributed(groupId: ID!): FundContribution!
  }
`;
