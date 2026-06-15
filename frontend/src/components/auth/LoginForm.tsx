"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, loginLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.emailOrUsername, values.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emailOrUsername">Username</Label>
        <Input
          id="emailOrUsername"
          placeholder="@username"
          {...register("emailOrUsername")}
        />
        {errors.emailOrUsername && <p className="text-xs text-destructive">{errors.emailOrUsername.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loginLoading}>
        {loginLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
