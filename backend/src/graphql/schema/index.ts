import { mergeTypeDefs } from "@graphql-tools/merge";
import { baseTypeDefs } from "./base.schema";
import { userTypeDefs } from "./user.schema";
import { groupTypeDefs } from "./group.schema";
import { treatTypeDefs } from "./treat.schema";
import { expenseTypeDefs } from "./expense.schema";
import { fundTypeDefs } from "./fund.schema";
import { loanTypeDefs } from "./loan.schema";
import { personalTypeDefs } from "./personal.schema";
import { activityTypeDefs } from "./activity.schema";

export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  userTypeDefs,
  groupTypeDefs,
  treatTypeDefs,
  expenseTypeDefs,
  fundTypeDefs,
  loanTypeDefs,
  personalTypeDefs,
  activityTypeDefs,
]);
