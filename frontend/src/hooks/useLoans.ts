"use client";

import { useMutation, useQuery } from "@apollo/client";
import { GROUP_LOANS_QUERY, MY_LOAN_SUMMARY_QUERY } from "@/graphql/queries/loan.queries";
import { GIVE_LOAN_MUTATION, REPAY_LOAN_MUTATION, DELETE_LOAN_MUTATION } from "@/graphql/mutations/loan.mutations";

const REFETCH = (groupId: string) => [
  { query: GROUP_LOANS_QUERY, variables: { groupId } },
  { query: MY_LOAN_SUMMARY_QUERY, variables: { groupId } },
];

export function useGroupLoans(groupId: string) {
  const { data, loading, error } = useQuery(GROUP_LOANS_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  return { loans: data?.groupLoans ?? [], loading, error };
}

export function useMyLoanSummary(groupId: string) {
  const { data, loading } = useQuery(MY_LOAN_SUMMARY_QUERY, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });
  return { summary: data?.myLoanSummary ?? { totalLent: 0, totalBorrowed: 0, netBalance: 0 }, loading };
}

export function useGiveLoan(groupId: string) {
  const [mutate, { loading }] = useMutation(GIVE_LOAN_MUTATION, {
    refetchQueries: REFETCH(groupId),
  });
  const giveLoan = (borrowerId: string, amount: number, description?: string) =>
    mutate({ variables: { groupId, borrowerId, amount, description } });
  return { giveLoan, loading };
}

export function useRepayLoan(groupId: string) {
  const [mutate, { loading }] = useMutation(REPAY_LOAN_MUTATION, {
    refetchQueries: REFETCH(groupId),
  });
  const repayLoan = (loanId: string, amount: number, note?: string) =>
    mutate({ variables: { loanId, amount, note } });
  return { repayLoan, loading };
}

export function useDeleteLoan(groupId: string) {
  const [mutate, { loading }] = useMutation(DELETE_LOAN_MUTATION, {
    refetchQueries: REFETCH(groupId),
  });
  const deleteLoan = (loanId: string) => mutate({ variables: { loanId } });
  return { deleteLoan, loading };
}
