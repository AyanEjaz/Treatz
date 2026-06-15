import { gql } from "@apollo/client";

export const GROUP_FUND_QUERY = gql`
  query GroupFund($groupId: ID!) {
    groupFund(groupId: $groupId) {
      total
      contributions {
        id
        amount
        note
        createdAt
        user {
          id
          name
          avatar
        }
      }
    }
  }
`;
