import { gql } from "@apollo/client";

export const GROUP_TREATS_QUERY = gql`
  query GroupTreats($groupId: ID!) {
    groupTreats(groupId: $groupId) {
      id
      description
      reason
      status
      createdAt
      updatedAt
      ower {
        id
        name
        avatar
      }
      addedBy {
        id
        name
        avatar
      }
    }
  }
`;
