import { gql } from "@apollo/client";

export const CONTRIBUTE_TO_FUND_MUTATION = gql`
  mutation ContributeToFund($groupId: ID!, $amount: Float!, $note: String) {
    contributeToFund(groupId: $groupId, amount: $amount, note: $note) {
      id
      amount
      note
      createdAt
      user { id name avatar }
    }
  }
`;
