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

export const GROUP_LOANS_QUERY = gql`
  query GroupLoans($groupId: ID!) {
    groupLoans(groupId: $groupId) {
      ${LOAN_FIELDS}
    }
  }
`;

export const MY_LOAN_SUMMARY_QUERY = gql`
  query MyLoanSummary($groupId: ID!) {
    myLoanSummary(groupId: $groupId) {
      totalLent
      totalBorrowed
      netBalance
    }
  }
`;
