"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddPersonalNote } from "@/hooks/usePersonal";
import { PersonalNoteType } from "@/types/personal.types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
  personName: z.string().min(1, "Name required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddPersonalNoteFormProps {
  onSuccess?: () => void;
}

export function AddPersonalNoteForm({ onSuccess }: AddPersonalNoteFormProps) {
  const { addNote, loading } = useAddPersonalNote();
  const [type, setType] = useState<PersonalNoteType>("GAVE");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await addNote(values.personName, type, values.amount, values.description);
      toast.success("Entry saved!");
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("GAVE")}
            className={cn(
              "rounded-lg border px-3 py-3 text-sm font-medium transition-all text-left",
              type === "GAVE"
                ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            💸 I gave money
            <p className="text-xs font-normal mt-0.5 opacity-70">they owe me</p>
          </button>
          <button
            type="button"
            onClick={() => setType("TOOK")}
            className={cn(
              "rounded-lg border px-3 py-3 text-sm font-medium transition-all text-left",
              type === "TOOK"
                ? "border-red-500 bg-red-500/10 text-red-500"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            🤝 They gave me
            <p className="text-xs font-normal mt-0.5 opacity-70">I owe them</p>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="personName">Person name (anyone)</Label>
        <Input id="personName" placeholder="e.g. Bilal, Shopkeeper, Uncle..." {...register("personName")} />
        {errors.personName && <p className="text-xs text-destructive">{errors.personName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (RS)</Label>
        <Input id="amount" type="number" placeholder="0" {...register("amount")} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Note (optional)</Label>
        <Input id="description" placeholder="e.g. Petrol money, dinner split..." {...register("description")} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Entry"}
      </Button>
    </form>
  );
}
