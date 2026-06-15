"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  GROUP_ACTIVITY_QUERY,
  MY_NOTIFICATIONS_QUERY,
  UNREAD_COUNT_QUERY,
  GROUP_ANALYTICS_QUERY,
} from "@/graphql/queries/activity.queries";
import {
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from "@/graphql/mutations/activity.mutations";

export function useGroupActivity(groupId: string) {
  const { data, loading } = useQuery(GROUP_ACTIVITY_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  return { activity: data?.groupActivity ?? [], loading };
}

export function useMyNotifications() {
  const { data, loading, refetch } = useQuery(MY_NOTIFICATIONS_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  return { notifications: data?.myNotifications ?? [], loading, refetch };
}

export function useUnreadCount() {
  const { data, refetch } = useQuery(UNREAD_COUNT_QUERY, {
    fetchPolicy: "cache-and-network",
    pollInterval: 30000,
  });
  return { count: data?.unreadNotificationCount ?? 0, refetch };
}

export function useMarkNotificationRead() {
  const [mutate] = useMutation(MARK_NOTIFICATION_READ_MUTATION, {
    refetchQueries: [{ query: MY_NOTIFICATIONS_QUERY }, { query: UNREAD_COUNT_QUERY }],
  });
  return (id: string) => mutate({ variables: { id } });
}

export function useMarkAllRead() {
  const [mutate, { loading }] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION, {
    refetchQueries: [{ query: MY_NOTIFICATIONS_QUERY }, { query: UNREAD_COUNT_QUERY }],
  });
  return { markAllRead: () => mutate(), loading };
}

export function useGroupAnalytics(groupId: string) {
  const { data, loading } = useQuery(GROUP_ANALYTICS_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  return { analytics: data?.groupAnalytics ?? null, loading };
}
