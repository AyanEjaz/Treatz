export const loanTypeDefs = `#graphql
  enum LoanStatus {
    PENDING
    PARTIAL
    SETTLED
  }

  type LoanRepayment {
    id: ID!
    amount: Float!
    note: String
    createdAt: String!
  }

  type Loan {
    id: ID!
    amount: Float!
    description: String
    status: LoanStatus!
    totalRepaid: Float!
    remaining: Float!
    lender: User!
    borrower: User!
    repayments: [LoanRepayment!]!
    createdAt: String!
  }

  type LoanSummary {
    totalLent: Float!
    totalBorrowed: Float!
    netBalance: Float!
  }

  extend type Query {
    groupLoans(groupId: ID!): [Loan!]!
    myLoanSummary(groupId: ID!): LoanSummary!
  }

  extend type Mutation {
    giveLoan(groupId: ID!, borrowerId: ID!, amount: Float!, description: String): Loan!
    repayLoan(loanId: ID!, amount: Float!, note: String): Loan!
    deleteLoan(loanId: ID!): Boolean!
  }
`;
