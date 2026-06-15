import { gql } from "@apollo/client";

const NOTE_FIELDS = `
  id personName type amount description status totalRepaid remaining createdAt updatedAt
  repayments { id amount note createdAt }
`;

export const MY_PERSONAL_NOTES_QUERY = gql`
  query MyPersonalNotes {
    myPersonalNotes { ${NOTE_FIELDS} }
  }
`;

export const MY_PERSONAL_SUMMARY_QUERY = gql`
  query MyPersonalSummary {
    myPersonalSummary {
      totalToReceive totalToGive netBalance pendingCount
    }
  }
`;

export const PERSONAL_NOTES_BY_PERSON_QUERY = gql`
  query PersonalNotesByPerson {
    personalNotesByPerson {
      personName totalToReceive totalToGive net
      notes { ${NOTE_FIELDS} }
    }
  }
`;
