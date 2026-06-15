import { gql } from "@apollo/client";

export const TREAT_ADDED_SUBSCRIPTION = gql`
  subscription TreatAdded($groupId: ID!) {
    treatAdded(groupId: $groupId) {
      id
      description
      status
      createdAt
      ower { id name avatar }
      addedBy { id name avatar }
    }
  }
`;

export const TREAT_UPDATED_SUBSCRIPTION = gql`
  subscription TreatUpdated($groupId: ID!) {
    treatUpdated(groupId: $groupId) {
      id
      status
      updatedAt
    }
  }
`;
