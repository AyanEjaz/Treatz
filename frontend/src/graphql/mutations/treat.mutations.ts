import { gql } from "@apollo/client";

export const ADD_TREAT_MUTATION = gql`
  mutation AddTreat($groupId: ID!, $description: String!, $reason: String, $owerId: ID!) {
    addTreat(groupId: $groupId, description: $description, reason: $reason, owerId: $owerId) {
      id
      description
      reason
      status
      createdAt
      ower { id name avatar }
      addedBy { id name avatar }
    }
  }
`;

export const COMPLETE_TREAT_MUTATION = gql`
  mutation CompleteTreat($id: ID!) {
    completeTreat(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const DELETE_TREAT_MUTATION = gql`
  mutation DeleteTreat($id: ID!) {
    deleteTreat(id: $id)
  }
`;
