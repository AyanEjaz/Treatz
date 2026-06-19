export const groupTypeDefs = `#graphql
  enum GroupRole {
    ADMIN
    MEMBER
  }

  enum GroupPermission {
    ADD_TREAT
    COMPLETE_TREAT
    DELETE_TREAT
    ADD_EXPENSE
    SETTLE_EXPENSE
    CONTRIBUTE_FUND
  }

  type GroupMember {
    id: ID!
    user: User!
    role: GroupRole!
    permissions: [String!]!
    joinedAt: String!
  }

  type Group {
    id: ID!
    name: String!
    description: String
    inviteCode: String!
    createdAt: String!
    members: [GroupMember!]!
    treatCount: Int!
    expenseTotal: Float!
    fundTotal: Float!
  }

  extend type Query {
    group(id: ID!): Group
    myGroups: [Group!]!
    myPermissions(groupId: ID!): [String!]!
  }

  extend type Mutation {
    createGroup(name: String!, description: String): Group!
    joinGroup(inviteCode: String!): Group!
    leaveGroup(groupId: ID!): Boolean!
    deleteGroup(groupId: ID!): Boolean!
    grantPermission(groupId: ID!, userId: ID!, permission: GroupPermission!): GroupMember!
    revokePermission(groupId: ID!, userId: ID!, permission: GroupPermission!): GroupMember!
  }
`;
