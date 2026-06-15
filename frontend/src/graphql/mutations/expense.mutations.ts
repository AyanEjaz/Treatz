import { gql } from "@apollo/client";

export const ADD_EXPENSE_MUTATION = gql`
  mutation AddExpense($groupId: ID!, $title: String!, $amount: Float!, $participants: [ParticipantInput!]!) {
    addExpense(groupId: $groupId, title: $title, amount: $amount, participants: $participants) {
      id
      title
      amount
      status
      createdAt
      splits { id paid owed settled user { id name avatar } }
    }
  }
`;

export const SETTLE_EXPENSE_MUTATION = gql`
  mutation SettleExpense($id: ID!) {
    settleExpense(id: $id) {
      id
      status
      updatedAt
      splits { id settled }
    }
  }
`;

export const DELETE_EXPENSE_MUTATION = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

export const RECORD_PAYMENT_MUTATION = gql`
  mutation RecordPayment($groupId: ID!, $toId: ID!, $amount: Float!, $note: String) {
    recordPayment(groupId: $groupId, toId: $toId, amount: $amount, note: $note) {
      id
      amount
      note
      createdAt
      from { id name avatar }
      to { id name avatar }
    }
  }
`;
