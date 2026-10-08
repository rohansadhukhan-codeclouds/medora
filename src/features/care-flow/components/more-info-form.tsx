"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";

export function MoreInfoForm() {
  const { state, setMoreInfoReply, submitMoreInfo } = useCareFlow();
  const [fileName, setFileName] = useState<string | null>(null);

  if (state.moreInfoSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Information submitted</CardTitle>
          <CardDescription>
            Your provider will review your response. This demo only updates
            frontend state.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>More information required</CardTitle>
        <CardDescription>Provider message</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
          {state.providerMessage}
        </p>
        <div className="space-y-2">
          <Label htmlFor="reply">Reply message</Label>
          <Textarea
            id="reply"
            value={state.moreInfoReply}
            onChange={(event) => setMoreInfoReply(event.target.value)}
            placeholder="Share the requested details…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="upload">Upload document (placeholder)</Label>
          <input
            id="upload"
            type="file"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? null)
            }
          />
          <p className="text-xs text-muted-foreground">
            Files are not uploaded anywhere in this demo.
            {fileName ? ` Selected: ${fileName}` : null}
          </p>
        </div>
        <Button
          type="button"
          disabled={!state.moreInfoReply.trim()}
          onClick={submitMoreInfo}
        >
          Submit response
        </Button>
      </CardContent>
    </Card>
  );
}
