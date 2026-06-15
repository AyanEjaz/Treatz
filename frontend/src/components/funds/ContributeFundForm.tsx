"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContributeToFund } from "@/hooks/useFunds";
import { toast } from "sonner";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ContributeFundFormProps {
  groupId: string;
  onSuccess?: () => void;
}

export function ContributeFundForm({ groupId, onSuccess }: ContributeFundFormProps) {
  const { contribute, loading } = useContributeToFund(groupId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await contribute(values.amount, values.note);
      toast.success("Contribution added to fund!");
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to contribute";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (RS)</Label>
        <Input id="amount" type="number" placeholder="0" {...register("amount")} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" placeholder="e.g. For upcoming trip" {...register("note")} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Contributing..." : "Contribute to Fund"}
      </Button>
    </form>
  );
}
