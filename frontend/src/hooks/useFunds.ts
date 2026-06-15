"use client";

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { GROUP_FUND_QUERY } from "@/graphql/queries/fund.queries";
import { CONTRIBUTE_TO_FUND_MUTATION } from "@/graphql/mutations/fund.mutations";
import { FUND_CONTRIBUTED_SUBSCRIPTION } from "@/graphql/subscriptions/fund.subscriptions";

export function useGroupFund(groupId: string) {
  const { data, loading, error, refetch } = useQuery(GROUP_FUND_QUERY, {
    variables: { groupId },
    skip: !groupId,
  });

  useSubscription(FUND_CONTRIBUTED_SUBSCRIPTION, {
    variables: { groupId },
    skip: !groupId,
    onData: () => { refetch(); },
  });

  return {
    fund: data?.groupFund ?? { total: 0, contributions: [] },
    loading,
    error,
  };
}

export function useContributeToFund(groupId: string) {
  const [mutate, { loading }] = useMutation(CONTRIBUTE_TO_FUND_MUTATION, {
    refetchQueries: [{ query: GROUP_FUND_QUERY, variables: { groupId } }],
  });

  const contribute = (amount: number, note?: string) =>
    mutate({ variables: { groupId, amount, note } });

  return { contribute, loading };
}
