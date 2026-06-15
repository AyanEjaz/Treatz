import { gql } from "@apollo/client";

const SPLIT_FIELDS = `
  id
  paid
  owed
  settled
  user { id name avatar }
`;

export const GROUP_EXPENSES_QUERY = gql`
  query GroupExpenses($groupId: ID!) {
    groupExpenses(groupId: $groupId) {
      id
      title
      amount
      status
      createdAt
      updatedAt
      splits {
        ${SPLIT_FIELDS}
      }
    }
  }
`;

export const GROUP_BALANCES_QUERY = gql`
  query GroupBalances($groupId: ID!) {
    groupBalances(groupId: $groupId) {
      fromUser { id name avatar }
      toUser { id name avatar }
      amount
    }
  }
`;
