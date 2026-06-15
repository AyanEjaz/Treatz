"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGroup } from "@/hooks/useGroup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Name min 2 characters"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateGroupFormProps {
  onSuccess?: () => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const router = useRouter();
  const { createGroup, loading } = useCreateGroup();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await createGroup(values.name, values.description);
      toast.success(`Group "${values.name}" created!`);
      onSuccess?.();
      router.push(`/groups/${data.createGroup.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create group";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Group Name</Label>
        <Input id="name" placeholder="Weekend Crew" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" placeholder="A short description..." {...register("description")} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Group"}
      </Button>
    </form>
  );
}
