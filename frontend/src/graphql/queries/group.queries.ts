import { gql } from "@apollo/client";

const MEMBER_FIELDS = `
  id
  role
  permissions
  joinedAt
  user {
    id
    name
    avatar
    email
  }
`;

export const MY_GROUPS_QUERY = gql`
  query MyGroups {
    myGroups {
      id
      name
      description
      inviteCode
      createdAt
      treatCount
      expenseTotal
      fundTotal
      members {
        ${MEMBER_FIELDS}
      }
    }
  }
`;

export const GROUP_QUERY = gql`
  query Group($id: ID!) {
    group(id: $id) {
      id
      name
      description
      inviteCode
      createdAt
      treatCount
      expenseTotal
      fundTotal
      members {
        ${MEMBER_FIELDS}
      }
    }
  }
`;

export const MY_PERMISSIONS_QUERY = gql`
  query MyPermissions($groupId: ID!) {
    myPermissions(groupId: $groupId)
  }
`;
