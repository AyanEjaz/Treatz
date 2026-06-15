import { gql } from "@apollo/client";

export const FUND_CONTRIBUTED_SUBSCRIPTION = gql`
  subscription FundContributed($groupId: ID!) {
    fundContributed(groupId: $groupId) {
      id
      amount
      note
      createdAt
      user { id name avatar }
    }
  }
`;
