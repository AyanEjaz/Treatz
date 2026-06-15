import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const SUBSCRIPTION_EVENTS = {
  TREAT_ADDED: "TREAT_ADDED",
  TREAT_UPDATED: "TREAT_UPDATED",
  EXPENSE_ADDED: "EXPENSE_ADDED",
  EXPENSE_UPDATED: "EXPENSE_UPDATED",
  FUND_CONTRIBUTED: "FUND_CONTRIBUTED",
} as const;
