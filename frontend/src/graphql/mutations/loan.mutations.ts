import { gql } from "@apollo/client";

const LOAN_FIELDS = `
  id
  amount
  description
  status
  totalRepaid
  remaining
  createdAt
  lender { id name avatar }
  borrower { id name avatar }
  repayments { id amount note createdAt }
`;

export const GIVE_LOAN_MUTATION = gql`
  mutation GiveLoan($groupId: ID!, $borrowerId: ID!, $amount: Float!, $description: String) {
    giveLoan(groupId: $groupId, borrowerId: $borrowerId, amount: $amount, description: $description) {
      ${LOAN_FIELDS}
    }
  }
`;

export const REPAY_LOAN_MUTATION = gql`
  mutation RepayLoan($loanId: ID!, $amount: Float!, $note: String) {
    repayLoan(loanId: $loanId, amount: $amount, note: $note) {
      ${LOAN_FIELDS}
    }
  }
`;

export const DELETE_LOAN_MUTATION = gql`
  mutation DeleteLoan($loanId: ID!) {
    deleteLoan(loanId: $loanId)
  }
`;
