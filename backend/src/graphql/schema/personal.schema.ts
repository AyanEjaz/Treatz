export const personalTypeDefs = `#graphql
  enum PersonalNoteType {
    GAVE
    TOOK
  }

  enum PersonalNoteStatus {
    PENDING
    PARTIAL
    SETTLED
  }

  type PersonalRepayment {
    id: ID!
    amount: Float!
    note: String
    createdAt: String!
  }

  type PersonalNote {
    id: ID!
    personName: String!
    type: PersonalNoteType!
    amount: Float!
    description: String
    status: PersonalNoteStatus!
    totalRepaid: Float!
    remaining: Float!
    repayments: [PersonalRepayment!]!
    createdAt: String!
    updatedAt: String!
  }

  type PersonalSummary {
    totalToReceive: Float!
    totalToGive: Float!
    netBalance: Float!
    pendingCount: Int!
  }

  type PersonByName {
    personName: String!
    totalToReceive: Float!
    totalToGive: Float!
    net: Float!
    notes: [PersonalNote!]!
  }

  extend type Query {
    myPersonalNotes: [PersonalNote!]!
    myPersonalSummary: PersonalSummary!
    personalNotesByPerson: [PersonByName!]!
  }

  extend type Mutation {
    addPersonalNote(
      personName: String!
      type: PersonalNoteType!
      amount: Float!
      description: String
    ): PersonalNote!

    editPersonalNote(
      id: ID!
      personName: String
      amount: Float
      description: String
    ): PersonalNote!

    deletePersonalNote(id: ID!): Boolean!

    addPersonalRepayment(
      noteId: ID!
      amount: Float!
      note: String
    ): PersonalNote!
  }
`;
