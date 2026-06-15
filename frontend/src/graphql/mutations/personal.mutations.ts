import { gql } from "@apollo/client";

const NOTE_FIELDS = `
  id personName type amount description status totalRepaid remaining createdAt updatedAt
  repayments { id amount note createdAt }
`;

export const ADD_PERSONAL_NOTE_MUTATION = gql`
  mutation AddPersonalNote($personName: String!, $type: PersonalNoteType!, $amount: Float!, $description: String) {
    addPersonalNote(personName: $personName, type: $type, amount: $amount, description: $description) {
      ${NOTE_FIELDS}
    }
  }
`;

export const EDIT_PERSONAL_NOTE_MUTATION = gql`
  mutation EditPersonalNote($id: ID!, $personName: String, $amount: Float, $description: String) {
    editPersonalNote(id: $id, personName: $personName, amount: $amount, description: $description) {
      ${NOTE_FIELDS}
    }
  }
`;

export const DELETE_PERSONAL_NOTE_MUTATION = gql`
  mutation DeletePersonalNote($id: ID!) {
    deletePersonalNote(id: $id)
  }
`;

export const ADD_PERSONAL_REPAYMENT_MUTATION = gql`
  mutation AddPersonalRepayment($noteId: ID!, $amount: Float!, $note: String) {
    addPersonalRepayment(noteId: $noteId, amount: $amount, note: $note) {
      ${NOTE_FIELDS}
    }
  }
`;
