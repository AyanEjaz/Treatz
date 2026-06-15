"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddTreat } from "@/hooks/useTreats";
import { GroupMember } from "@/types/group.types";
import { toast } from "sonner";

const schema = z.object({
  description: z.string().min(3, "Description min 3 characters"),
  reason: z.string().optional(),
  owerId: z.string().min(1, "Select who owes the treat"),
});

type FormValues = z.infer<typeof schema>;

interface AddTreatFormProps {
  groupId: string;
  members: GroupMember[];
  onSuccess?: () => void;
}

export function AddTreatForm({ groupId, members, onSuccess }: AddTreatFormProps) {
  const { addTreat, loading } = useAddTreat(groupId);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await addTreat(values.description, values.owerId, values.reason);
      toast.success("Treat added!");
      reset();
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add treat";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">What&apos;s the treat?</Label>
        <Input id="description" placeholder="e.g. Lunch at Burns Road" {...register("description")} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Input id="reason" placeholder="e.g. Won the bet" {...register("reason")} />
      </div>

      <div className="space-y-2">
        <Label>Who owes it?</Label>
        <Select onValueChange={(val) => setValue("owerId", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.user.id} value={m.user.id}>
                {m.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.owerId && <p className="text-xs text-destructive">{errors.owerId.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding..." : "Add Treat"}
      </Button>
    </form>
  );
}
