"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface InviteCodeProps {
  code: string;
}

export function InviteCode({ code }: InviteCodeProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Label>Invite Code</Label>
      <div className="flex gap-2">
        <Input
          value={code}
          readOnly
          className="font-mono text-center tracking-widest font-semibold"
        />
        <Button variant="outline" size="icon" onClick={copy} aria-label="Copy invite code">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Share this code with friends to invite them to the group.
      </p>
    </div>
  );
}
