import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($password: String!, $name: String!, $username: String!) {
    register(password: $password, name: $name, username: $username) {
      token
      user {
        id
        username
        name
        avatar
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($emailOrUsername: String!, $password: String!) {
    login(emailOrUsername: $emailOrUsername, password: $password) {
      token
      user {
        id
        email
        username
        name
        avatar
      }
    }
  }
`;

export const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($idToken: String!) {
    googleAuth(idToken: $idToken) {
      token
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id
      name
      avatar
    }
  }
`;
