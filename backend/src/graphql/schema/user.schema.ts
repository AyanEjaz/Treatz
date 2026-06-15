export const userTypeDefs = `#graphql
  type User {
    id: ID!
    email: String
    username: String
    name: String!
    avatar: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    checkUsername(username: String!): Boolean!
  }

  extend type Mutation {
    register(password: String!, name: String!, username: String!): AuthPayload!
    login(emailOrUsername: String!, password: String!): AuthPayload!
    googleAuth(idToken: String!): AuthPayload!
    updateProfile(name: String, avatar: String): User!
  }
`;
