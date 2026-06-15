"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGiveLoan } from "@/hooks/useLoans";
import { GroupMember } from "@/types/group.types";
import { toast } from "sonner";

const schema = z.object({
  borrowerId: z.string().min(1, "Select who you gave money to"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface GiveLoanFormProps {
  groupId: string;
  members: GroupMember[];
  currentUserId: string;
  onSuccess?: () => void;
}

export function GiveLoanForm({ groupId, members, currentUserId, onSuccess }: GiveLoanFormProps) {
  const { giveLoan, loading } = useGiveLoan(groupId);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const otherMembers = members.filter((m) => m.user.id !== currentUserId);

  const onSubmit = async (values: FormValues) => {
    try {
      await giveLoan(values.borrowerId, values.amount, values.description);
      toast.success("Loan recorded!");
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to record loan");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Who did you give money to?</Label>
        <Select onValueChange={(v) => setValue("borrowerId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {otherMembers.map((m) => (
              <SelectItem key={m.user.id} value={m.user.id}>
                {m.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.borrowerId && <p className="text-xs text-destructive">{errors.borrowerId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (RS)</Label>
        <Input id="amount" type="number" placeholder="0" {...register("amount")} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Note (optional)</Label>
        <Input id="description" placeholder="e.g. Petrol money" {...register("description")} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Record Loan"}
      </Button>
    </form>
  );
}
