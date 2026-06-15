"use client";

import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/graphql";

function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("treatz_token") ?? undefined;
}

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  headers: {
    get authorization() {
      const t = getToken();
      return t ? `Bearer ${t}` : "";
    },
  },
});

function makeLink() {
  if (typeof window === "undefined") return httpLink;

  const { GraphQLWsLink } = require("@apollo/client/link/subscriptions");
  const { createClient } = require("graphql-ws");

  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_URL,
      connectionParams: () => {
        const token = getToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    })
  );

  return split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === "OperationDefinition" && def.operation === "subscription";
    },
    wsLink,
    httpLink
  );
}

export const apolloClient = new ApolloClient({
  link: makeLink(),
  cache: new InMemoryCache(),
  ssrMode: typeof window === "undefined",
  connectToDevTools: process.env.NODE_ENV === "development",
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  },
});
