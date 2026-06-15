"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AtSign, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  name: z.string().min(2, "Name min 2 characters"),
  username: z
    .string()
    .min(3, "Min 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscore"),
  password: z.string().min(6, "Password min 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { register: registerUser, registerLoading } = useAuth();
  const [created, setCreated] = useState<{ name: string; username: string } | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const usernameVal = watch("username", "");

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await registerUser(values.password, values.name, values.username.toLowerCase());
      setCreated({ name: values.name, username: values.username.toLowerCase() });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    }
  };

  if (created) {
    return (
      <div className="space-y-5 text-center py-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-fuchsia-500/30">
          <Check className="h-7 w-7 text-white" />
        </div>
        <div>
          <p className="font-bold text-lg">Welcome, {created.name}! 🎉</p>
          <p className="text-sm text-muted-foreground mt-1">Your account is ready</p>
        </div>

        <div className="rounded-xl border-2 border-fuchsia-500/20 bg-fuchsia-500/5 p-4 text-left space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your username</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xl font-black text-fuchsia-500">@{created.username}</span>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(created.username); toast.success("Copied!"); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Next time login with <strong>@{created.username}</strong> + your password
          </p>
        </div>

        <Button className="w-full" onClick={() => router.push("/dashboard")}>
          Go to Dashboard →
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Ayan Ejaz" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            id="username"
            placeholder="ayan_ejaz"
            className="pl-9"
            {...register("username")}
            onChange={(e) => {
              e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
              register("username").onChange(e);
            }}
          />
        </div>
        {usernameVal && !errors.username && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <Check className="h-3 w-3" /> @{usernameVal}
          </p>
        )}
        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={registerLoading}>
        {registerLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
