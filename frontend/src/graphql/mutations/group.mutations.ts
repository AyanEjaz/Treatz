import { gql } from "@apollo/client";

export const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($name: String!, $description: String) {
    createGroup(name: $name, description: $description) {
      id
      name
      description
      inviteCode
      createdAt
      treatCount
      expenseTotal
      fundTotal
      members {
        id
        role
        permissions
        user { id name avatar }
      }
    }
  }
`;

export const JOIN_GROUP_MUTATION = gql`
  mutation JoinGroup($inviteCode: String!) {
    joinGroup(inviteCode: $inviteCode) {
      id
      name
      description
      inviteCode
    }
  }
`;

export const LEAVE_GROUP_MUTATION = gql`
  mutation LeaveGroup($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`;

export const DELETE_GROUP_MUTATION = gql`
  mutation DeleteGroup($groupId: ID!) {
    deleteGroup(groupId: $groupId)
  }
`;

export const GRANT_PERMISSION_MUTATION = gql`
  mutation GrantPermission($groupId: ID!, $userId: ID!, $permission: GroupPermission!) {
    grantPermission(groupId: $groupId, userId: $userId, permission: $permission) {
      id
      permissions
      user { id name }
    }
  }
`;

export const REVOKE_PERMISSION_MUTATION = gql`
  mutation RevokePermission($groupId: ID!, $userId: ID!, $permission: GroupPermission!) {
    revokePermission(groupId: $groupId, userId: $userId, permission: $permission) {
      id
      permissions
      user { id name }
    }
  }
`;
