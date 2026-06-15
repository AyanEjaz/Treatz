import { gql } from "@apollo/client";

export const EXPENSE_ADDED_SUBSCRIPTION = gql`
  subscription ExpenseAdded($groupId: ID!) {
    expenseAdded(groupId: $groupId) {
      id
      title
      amount
      status
      createdAt
      splits { id paid owed settled user { id name avatar } }
    }
  }
`;

export const EXPENSE_UPDATED_SUBSCRIPTION = gql`
  subscription ExpenseUpdated($groupId: ID!) {
    expenseUpdated(groupId: $groupId) {
      id
      status
      updatedAt
      splits { id settled }
    }
  }
`;
