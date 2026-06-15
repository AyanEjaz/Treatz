import { gql } from "@apollo/client";

export const GROUP_ACTIVITY_QUERY = gql`
  query GroupActivity($groupId: ID!) {
    groupActivity(groupId: $groupId) {
      id
      type
      message
      metadata
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`;

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications {
    myNotifications {
      id
      type
      message
      read
      createdAt
      group {
        id
        name
      }
    }
  }
`;

export const UNREAD_COUNT_QUERY = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const GROUP_ANALYTICS_QUERY = gql`
  query GroupAnalytics($groupId: ID!) {
    groupAnalytics(groupId: $groupId) {
      memberSpending {
        user {
          id
          name
          avatar
        }
        totalOwed
        totalPaid
      }
      monthlySpending {
        month
        amount
      }
      totalExpenses
      totalTreats
      totalFund
    }
  }
`;
