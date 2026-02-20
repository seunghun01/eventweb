"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

type InviteShareProps = {
  inviteCode: string;
};

export function InviteShare({ inviteCode }: InviteShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/invite/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="mr-1.5 size-3.5" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="mr-1.5 size-3.5" />
          초대 링크 복사
        </>
      )}
    </Button>
  );
}
