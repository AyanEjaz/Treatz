"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Receipt, Gift, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupAnalytics } from "@/hooks/useActivity";
import { formatCurrency } from "@/utils/currency.utils";

const COLORS = ["#d946ef", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

interface MemberSpending {
  user: { id: string; name: string; avatar?: string };
  totalOwed: number;
  totalPaid: number;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

function StatTile({ icon: Icon, label, value, color }: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-bold">{value}</p>
      </div>
    </div>
  );
}

function formatMonth(m: string) {
  const [year, month] = m.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short" });
}

export function GroupAnalyticsView({ groupId }: { groupId: string }) {
  const { analytics, loading } = useGroupAnalytics(groupId);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted" />)}
        </div>
        <div className="h-52 rounded-xl bg-muted" />
        <div className="h-52 rounded-xl bg-muted" />
      </div>
    );
  }

  if (!analytics) return null;

  const memberData = analytics.memberSpending.map((m: MemberSpending) => ({
    name: m.user.name.split(" ")[0],
    owed: Math.round(m.totalOwed),
    paid: Math.round(m.totalPaid),
  }));

  const monthData = analytics.monthlySpending.map((m: MonthlySpending) => ({
    month: formatMonth(m.month),
    amount: Math.round(m.amount),
  }));

  const pieData = analytics.memberSpending
    .filter((m: MemberSpending) => m.totalOwed > 0)
    .map((m: MemberSpending) => ({
      name: m.user.name.split(" ")[0],
      value: Math.round(m.totalOwed),
    }));

  return (
    <div className="space-y-5">
      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile icon={Receipt} label="Total Expenses" value={formatCurrency(analytics.totalExpenses)} color="bg-blue-500/10 text-blue-500" />
        <StatTile icon={Gift} label="Total Treats" value={`${analytics.totalTreats}`} color="bg-fuchsia-500/10 text-fuchsia-500" />
        <StatTile icon={PiggyBank} label="Total Fund" value={formatCurrency(analytics.totalFund)} color="bg-violet-500/10 text-violet-500" />
      </div>

      {/* Monthly spending bar chart */}
      {monthData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-fuchsia-500" />
              Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v) || 0), "Amount"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Per-member spending */}
      {memberData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Per-Member Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={memberData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  formatter={(v, name) => [formatCurrency(Number(v) || 0), name === "paid" ? "Paid" : "Owed"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="paid" fill="#10b981" radius={[0, 4, 4, 0]} name="Paid" />
                <Bar dataKey="owed" fill="#d946ef" radius={[0, 4, 4, 0]} name="Owed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Pie chart */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Expense Share</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_: { name: string; value: number }, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v) || 0), "Owed"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
