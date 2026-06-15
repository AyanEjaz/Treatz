export const activityTypeDefs = `#graphql
  type ActivityLog {
    id: ID!
    groupId: ID!
    userId: ID!
    type: String!
    message: String!
    metadata: String
    createdAt: String!
    user: User!
    group: Group!
  }

  type Notification {
    id: ID!
    userId: ID!
    groupId: ID
    type: String!
    message: String!
    read: Boolean!
    createdAt: String!
    group: Group
  }

  type MemberSpending {
    user: User!
    totalOwed: Float!
    totalPaid: Float!
  }

  type MonthlySpending {
    month: String!
    amount: Float!
  }

  type GroupAnalytics {
    memberSpending: [MemberSpending!]!
    monthlySpending: [MonthlySpending!]!
    totalExpenses: Float!
    totalTreats: Int!
    totalFund: Float!
  }

  extend type Query {
    groupActivity(groupId: ID!): [ActivityLog!]!
    myNotifications: [Notification!]!
    unreadNotificationCount: Int!
    groupAnalytics(groupId: ID!): GroupAnalytics!
  }

  extend type Mutation {
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: Boolean!
  }
`;
