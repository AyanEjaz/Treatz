import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Pick a username and join your friends on Treatz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
