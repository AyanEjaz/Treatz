"use client";

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { GROUP_TREATS_QUERY } from "@/graphql/queries/treat.queries";
import { ADD_TREAT_MUTATION, COMPLETE_TREAT_MUTATION, DELETE_TREAT_MUTATION } from "@/graphql/mutations/treat.mutations";
import { TREAT_ADDED_SUBSCRIPTION, TREAT_UPDATED_SUBSCRIPTION } from "@/graphql/subscriptions/treat.subscriptions";

export function useGroupTreats(groupId: string) {
  const { data, loading, error } = useQuery(GROUP_TREATS_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });

  useSubscription(TREAT_ADDED_SUBSCRIPTION, {
    variables: { groupId },
    skip: !groupId,
    onData: ({ client, data: subData }) => {
      const newTreat = subData.data?.treatAdded;
      if (!newTreat) return;
      const existing = client.readQuery({ query: GROUP_TREATS_QUERY, variables: { groupId } });
      if (!existing) return;
      const alreadyExists = existing.groupTreats.some((t: { id: string }) => t.id === newTreat.id);
      if (alreadyExists) return;
      client.writeQuery({
        query: GROUP_TREATS_QUERY,
        variables: { groupId },
        data: { groupTreats: [newTreat, ...existing.groupTreats] },
      });
    },
  });

  useSubscription(TREAT_UPDATED_SUBSCRIPTION, { variables: { groupId }, skip: !groupId });

  return { treats: data?.groupTreats ?? [], loading, error };
}

export function useAddTreat(groupId: string) {
  const [mutate, { loading }] = useMutation(ADD_TREAT_MUTATION);
  const addTreat = (description: string, owerId: string, reason?: string) =>
    mutate({ variables: { groupId, description, owerId, reason } });
  return { addTreat, loading };
}

export function useCompleteTreat() {
  const [mutate, { loading }] = useMutation(COMPLETE_TREAT_MUTATION);
  const completeTreat = (id: string) => mutate({ variables: { id } });
  return { completeTreat, loading };
}

export function useDeleteTreat(groupId: string) {
  const [mutate, { loading }] = useMutation(DELETE_TREAT_MUTATION, {
    refetchQueries: [{ query: GROUP_TREATS_QUERY, variables: { groupId } }],
  });
  const deleteTreat = (id: string) => mutate({ variables: { id } });
  return { deleteTreat, loading };
}
