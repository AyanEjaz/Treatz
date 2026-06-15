"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  MY_PERSONAL_NOTES_QUERY,
  MY_PERSONAL_SUMMARY_QUERY,
  PERSONAL_NOTES_BY_PERSON_QUERY,
} from "@/graphql/queries/personal.queries";
import {
  ADD_PERSONAL_NOTE_MUTATION,
  EDIT_PERSONAL_NOTE_MUTATION,
  DELETE_PERSONAL_NOTE_MUTATION,
  ADD_PERSONAL_REPAYMENT_MUTATION,
} from "@/graphql/mutations/personal.mutations";
import { PersonalNoteType } from "@/types/personal.types";

const REFETCH = [
  { query: MY_PERSONAL_NOTES_QUERY },
  { query: MY_PERSONAL_SUMMARY_QUERY },
  { query: PERSONAL_NOTES_BY_PERSON_QUERY },
];

export function useMyPersonalNotes() {
  const { data, loading, error } = useQuery(MY_PERSONAL_NOTES_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  return { notes: data?.myPersonalNotes ?? [], loading, error };
}

export function useMyPersonalSummary() {
  const { data, loading } = useQuery(MY_PERSONAL_SUMMARY_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  return {
    summary: data?.myPersonalSummary ?? { totalToReceive: 0, totalToGive: 0, netBalance: 0, pendingCount: 0 },
    loading,
  };
}

export function usePersonalNotesByPerson() {
  const { data, loading } = useQuery(PERSONAL_NOTES_BY_PERSON_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  return { byPerson: data?.personalNotesByPerson ?? [], loading };
}

export function useAddPersonalNote() {
  const [mutate, { loading }] = useMutation(ADD_PERSONAL_NOTE_MUTATION, { refetchQueries: REFETCH });
  const addNote = (personName: string, type: PersonalNoteType, amount: number, description?: string) =>
    mutate({ variables: { personName, type, amount, description } });
  return { addNote, loading };
}

export function useEditPersonalNote() {
  const [mutate, { loading }] = useMutation(EDIT_PERSONAL_NOTE_MUTATION, { refetchQueries: REFETCH });
  const editNote = (id: string, personName?: string, amount?: number, description?: string) =>
    mutate({ variables: { id, personName, amount, description } });
  return { editNote, loading };
}

export function useDeletePersonalNote() {
  const [mutate, { loading }] = useMutation(DELETE_PERSONAL_NOTE_MUTATION, { refetchQueries: REFETCH });
  const deleteNote = (id: string) => mutate({ variables: { id } });
  return { deleteNote, loading };
}

export function useAddPersonalRepayment() {
  const [mutate, { loading }] = useMutation(ADD_PERSONAL_REPAYMENT_MUTATION, { refetchQueries: REFETCH });
  const addRepayment = (noteId: string, amount: number, note?: string) =>
    mutate({ variables: { noteId, amount, note } });
  return { addRepayment, loading };
}
