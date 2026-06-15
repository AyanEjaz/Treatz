"use client";

import { useMutation, useQuery } from "@apollo/client";
import { MY_GROUPS_QUERY, GROUP_QUERY, MY_PERMISSIONS_QUERY } from "@/graphql/queries/group.queries";
import {
  CREATE_GROUP_MUTATION,
  JOIN_GROUP_MUTATION,
  LEAVE_GROUP_MUTATION,
  GRANT_PERMISSION_MUTATION,
  REVOKE_PERMISSION_MUTATION,
} from "@/graphql/mutations/group.mutations";

export function useMyGroups() {
  const { data, loading, error, refetch } = useQuery(MY_GROUPS_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  return { groups: data?.myGroups ?? [], loading, error, refetch };
}

export function useGroup(id: string) {
  const { data, loading, error, refetch } = useQuery(GROUP_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });
  return { group: data?.group ?? null, loading, error, refetch };
}

export function useMyPermissions(groupId: string) {
  const { data, loading } = useQuery(MY_PERMISSIONS_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  const permissions: string[] = data?.myPermissions ?? [];
  const can = (permission: string) => permissions.includes(permission);
  return { permissions, can, loading };
}

export function useCreateGroup() {
  const [mutate, { loading }] = useMutation(CREATE_GROUP_MUTATION, {
    refetchQueries: [{ query: MY_GROUPS_QUERY }],
  });
  const createGroup = (name: string, description?: string) =>
    mutate({ variables: { name, description } });
  return { createGroup, loading };
}

export function useJoinGroup() {
  const [mutate, { loading }] = useMutation(JOIN_GROUP_MUTATION, {
    refetchQueries: [{ query: MY_GROUPS_QUERY }],
  });
  const joinGroup = (inviteCode: string) => mutate({ variables: { inviteCode } });
  return { joinGroup, loading };
}

export function useLeaveGroup() {
  const [mutate, { loading }] = useMutation(LEAVE_GROUP_MUTATION, {
    refetchQueries: [{ query: MY_GROUPS_QUERY }],
  });
  const leaveGroup = (groupId: string) => mutate({ variables: { groupId } });
  return { leaveGroup, loading };
}

export function useGrantPermission(groupId: string) {
  const [mutate, { loading }] = useMutation(GRANT_PERMISSION_MUTATION, {
    refetchQueries: [{ query: GROUP_QUERY, variables: { id: groupId } }],
  });
  const grantPermission = (userId: string, permission: string) =>
    mutate({ variables: { groupId, userId, permission } });
  return { grantPermission, loading };
}

export function useRevokePermission(groupId: string) {
  const [mutate, { loading }] = useMutation(REVOKE_PERMISSION_MUTATION, {
    refetchQueries: [{ query: GROUP_QUERY, variables: { id: groupId } }],
  });
  const revokePermission = (userId: string, permission: string) =>
    mutate({ variables: { groupId, userId, permission } });
  return { revokePermission, loading };
}
