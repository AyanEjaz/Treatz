import { mergeResolvers } from "@graphql-tools/merge";
import { userResolvers } from "./user.resolver";
import { groupResolvers } from "./group.resolver";
import { treatResolvers } from "./treat.resolver";
import { expenseResolvers } from "./expense.resolver";
import { fundResolvers } from "./fund.resolver";
import { loanResolvers } from "./loan.resolver";
import { personalResolvers } from "./personal.resolver";
import { activityResolvers } from "./activity.resolver";

export const resolvers = mergeResolvers([
  userResolvers,
  groupResolvers,
  treatResolvers,
  expenseResolvers,
  fundResolvers,
  loanResolvers,
  personalResolvers,
  activityResolvers,
]);
