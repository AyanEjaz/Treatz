"use client";

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { GROUP_EXPENSES_QUERY, GROUP_BALANCES_QUERY } from "@/graphql/queries/expense.queries";
import {
  ADD_EXPENSE_MUTATION,
  SETTLE_EXPENSE_MUTATION,
  DELETE_EXPENSE_MUTATION,
  RECORD_PAYMENT_MUTATION,
} from "@/graphql/mutations/expense.mutations";
import { EXPENSE_ADDED_SUBSCRIPTION, EXPENSE_UPDATED_SUBSCRIPTION } from "@/graphql/subscriptions/expense.subscriptions";

interface ParticipantInput { userId: string; paid: number; owed?: number }

export function useGroupExpenses(groupId: string) {
  const { data, loading, error } = useQuery(GROUP_EXPENSES_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });

  useSubscription(EXPENSE_ADDED_SUBSCRIPTION, {
    variables: { groupId },
    skip: !groupId,
    onData: ({ client, data: subData }) => {
      const newExpense = subData.data?.expenseAdded;
      if (!newExpense) return;
      const existing = client.readQuery({ query: GROUP_EXPENSES_QUERY, variables: { groupId } });
      if (!existing) return;
      const alreadyExists = existing.groupExpenses.some((e: { id: string }) => e.id === newExpense.id);
      if (alreadyExists) return;
      client.writeQuery({
        query: GROUP_EXPENSES_QUERY,
        variables: { groupId },
        data: { groupExpenses: [newExpense, ...existing.groupExpenses] },
      });
    },
  });

  useSubscription(EXPENSE_UPDATED_SUBSCRIPTION, { variables: { groupId }, skip: !groupId });

  return { expenses: data?.groupExpenses ?? [], loading, error };
}

export function useGroupBalances(groupId: string) {
  const { data, loading, refetch } = useQuery(GROUP_BALANCES_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  return { balances: data?.groupBalances ?? [], loading, refetch };
}

export function useAddExpense(groupId: string) {
  const [mutate, { loading }] = useMutation(ADD_EXPENSE_MUTATION, {
    refetchQueries: [
      { query: GROUP_EXPENSES_QUERY, variables: { groupId } },
      { query: GROUP_BALANCES_QUERY, variables: { groupId } },
    ],
  });
  const addExpense = (title: string, amount: number, participants: ParticipantInput[]) =>
    mutate({ variables: { groupId, title, amount, participants } });
  return { addExpense, loading };
}

export function useSettleExpense(groupId: string) {
  const [mutate, { loading }] = useMutation(SETTLE_EXPENSE_MUTATION, {
    refetchQueries: [{ query: GROUP_BALANCES_QUERY, variables: { groupId } }],
  });
  const settleExpense = (id: string) => mutate({ variables: { id } });
  return { settleExpense, loading };
}

export function useDeleteExpense(groupId: string) {
  const [mutate, { loading }] = useMutation(DELETE_EXPENSE_MUTATION, {
    refetchQueries: [
      { query: GROUP_EXPENSES_QUERY, variables: { groupId } },
      { query: GROUP_BALANCES_QUERY, variables: { groupId } },
    ],
  });
  const deleteExpense = (id: string) => mutate({ variables: { id } });
  return { deleteExpense, loading };
}

export function useRecordPayment(groupId: string) {
  const [mutate, { loading }] = useMutation(RECORD_PAYMENT_MUTATION, {
    refetchQueries: [{ query: GROUP_BALANCES_QUERY, variables: { groupId } }],
  });
  const recordPayment = (toId: string, amount: number, note?: string) =>
    mutate({ variables: { groupId, toId, amount, note } });
  return { recordPayment, loading };
}
