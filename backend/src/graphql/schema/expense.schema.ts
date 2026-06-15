export const expenseTypeDefs = `#graphql
  enum ExpenseStatus {
    PENDING
    SETTLED
  }

  type ExpenseSplit {
    id: ID!
    user: User!
    paid: Float!
    owed: Float!
    settled: Boolean!
  }

  type Expense {
    id: ID!
    title: String!
    amount: Float!
    status: ExpenseStatus!
    splits: [ExpenseSplit!]!
    group: Group!
    createdAt: String!
    updatedAt: String!
  }

  type Balance {
    fromUser: User!
    toUser: User!
    amount: Float!
  }

  type Payment {
    id: ID!
    amount: Float!
    note: String
    from: User!
    to: User!
    createdAt: String!
  }

  input ParticipantInput {
    userId: ID!
    paid: Float!
    owed: Float
  }

  extend type Query {
    groupExpenses(groupId: ID!): [Expense!]!
    groupBalances(groupId: ID!): [Balance!]!
    groupPayments(groupId: ID!): [Payment!]!
  }

  extend type Mutation {
    addExpense(
      groupId: ID!
      title: String!
      amount: Float!
      participants: [ParticipantInput!]!
    ): Expense!
    settleExpense(id: ID!): Expense!
    deleteExpense(id: ID!): Boolean!
    recordPayment(groupId: ID!, toId: ID!, amount: Float!, note: String): Payment!
  }

  extend type Subscription {
    expenseAdded(groupId: ID!): Expense!
    expenseUpdated(groupId: ID!): Expense!
  }
`;
