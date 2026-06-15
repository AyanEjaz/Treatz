"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GroupStats } from "@/components/groups/GroupStats";
import { InviteCode } from "@/components/groups/InviteCode";
import { MemberPermissions } from "@/components/groups/MemberPermissions";
import { TreatList } from "@/components/treats/TreatList";
import { AddTreatForm } from "@/components/treats/AddTreatForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { GroupBalances } from "@/components/expenses/GroupBalances";
import { FundBalance } from "@/components/funds/FundBalance";
import { FundHistory } from "@/components/funds/FundHistory";
import { ContributeFundForm } from "@/components/funds/ContributeFundForm";
import { LoanSummary } from "@/components/loans/LoanSummary";
import { LoanList } from "@/components/loans/LoanList";
import { GiveLoanForm } from "@/components/loans/GiveLoanForm";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { useGroup, useMyPermissions } from "@/hooks/useGroup";
import { useGroupTreats } from "@/hooks/useTreats";
import { useGroupExpenses } from "@/hooks/useExpenses";
import { useGroupFund } from "@/hooks/useFunds";
import { useGroupLoans } from "@/hooks/useLoans";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";

const ActivityFeed = dynamic(
  () => import("@/components/activity/ActivityFeed").then((m) => ({ default: m.ActivityFeed })),
  { loading: () => <div className="animate-pulse h-48 bg-muted rounded-xl" /> }
);
const GroupAnalyticsView = dynamic(
  () => import("@/components/analytics/GroupAnalytics").then((m) => ({ default: m.GroupAnalyticsView })),
  { loading: () => <div className="animate-pulse h-64 bg-muted rounded-xl" /> }
);

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "treats";

  const { group, loading } = useGroup(id);
  const { treats, loading: treatsLoading } = useGroupTreats(id);
  const { expenses, loading: expensesLoading } = useGroupExpenses(id);
  const { fund, loading: fundLoading } = useGroupFund(id);
  const { loans, loading: loansLoading } = useGroupLoans(id);
  const { currentUser } = useAuth();
  const { can } = useMyPermissions(id);

  const [treatOpen, setTreatOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);

  if (loading) return <PageLoader />;
  if (!group) return <div className="text-center py-12 text-muted-foreground">Group not found</div>;

  const currentMember = group.members.find((m) => m.user.id === currentUser?.id);
  const isAdmin = currentMember?.role === "ADMIN";

  const handleTabChange = (value: string) => {
    router.push(`/groups/${id}?tab=${value}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && <p className="text-muted-foreground text-sm mt-1">{group.description}</p>}
        </div>
        <InviteCode code={group.inviteCode} />
      </div>

      <GroupStats group={group} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="treats">Treats</TabsTrigger>
          <TabsTrigger value="expenses">Bill Split</TabsTrigger>
          <TabsTrigger value="loans">Udhar</TabsTrigger>
          <TabsTrigger value="fund">Fund</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          {isAdmin && <TabsTrigger value="permissions">Permissions</TabsTrigger>}
        </TabsList>

        <TabsContent value="treats" className="mt-4 space-y-4">
          {can("ADD_TREAT") && (
            <div className="flex justify-end">
              <Dialog open={treatOpen} onOpenChange={setTreatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Treat</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add a Treat</DialogTitle></DialogHeader>
                  <AddTreatForm groupId={id} members={group.members} onSuccess={() => setTreatOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          )}
          <TreatList
            treats={treats}
            members={group.members}
            groupId={id}
            loading={treatsLoading}
            canComplete={can("COMPLETE_TREAT")}
            canDelete={can("DELETE_TREAT")}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-4">
          <GroupBalances groupId={id} />

          {can("ADD_EXPENSE") && (
            <div className="flex justify-end">
              <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Split Bill</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Split the Bill</DialogTitle></DialogHeader>
                  <AddExpenseForm groupId={id} members={group.members} onSuccess={() => setExpenseOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          )}
          <ExpenseList expenses={expenses} groupId={id} loading={expensesLoading} canManage={can("SETTLE_EXPENSE")} />
        </TabsContent>

        <TabsContent value="loans" className="mt-4 space-y-4">
          <LoanSummary groupId={id} />
          <div className="flex justify-end">
            <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />Give Udhar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record a Loan</DialogTitle></DialogHeader>
                <GiveLoanForm
                  groupId={id}
                  members={group.members}
                  currentUserId={currentUser?.id ?? ""}
                  onSuccess={() => setLoanOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <LoanList
            loans={loans}
            groupId={id}
            currentUserId={currentUser?.id ?? ""}
            loading={loansLoading}
          />
        </TabsContent>

        <TabsContent value="fund" className="mt-4 space-y-4">
          {!fundLoading && <FundBalance fund={fund} />}
          {can("CONTRIBUTE_FUND") && (
            <div className="flex justify-end">
              <Dialog open={fundOpen} onOpenChange={setFundOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Contribute</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Contribute to Fund</DialogTitle></DialogHeader>
                  <ContributeFundForm groupId={id} onSuccess={() => setFundOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          )}
          <FundHistory contributions={fund.contributions} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityFeed groupId={id} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <GroupAnalyticsView groupId={id} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="permissions" className="mt-4">
            <MemberPermissions members={group.members} groupId={id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
