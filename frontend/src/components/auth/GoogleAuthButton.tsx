"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface GoogleAuthButtonProps {
  onSuccess: (idToken: string) => void;
  loading?: boolean;
}

export function GoogleAuthButton({ onSuccess, loading }: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || typeof window === "undefined" || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        onSuccess(response.credential);
      },
    });

    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: "100%",
      });
    }
  }, [onSuccess]);

  return (
    <div className="w-full">
      <div ref={buttonRef} />
      {loading && (
        <Button variant="outline" className="w-full mt-2" disabled>
          Signing in with Google...
        </Button>
      )}
    </div>
  );
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
        };
      };
    };
  }
}
