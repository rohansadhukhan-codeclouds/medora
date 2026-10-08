"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";
import { WEIGHT_MANAGEMENT_PRODUCTS } from "@/features/care-flow/data/products";

export function SwapView() {
  const {
    selectedProduct,
    state,
    setSwapProductId,
    submitSwap,
  } = useCareFlow();
  const [step, setStep] = useState<"current" | "alternatives" | "review" | "done">(
    "current",
  );

  if (state.swapSubmitted || step === "done") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change request submitted</CardTitle>
          <CardDescription>
            Treatment changes require provider approval. Your request is now in
            mock provider review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/portal/treatments">Back to treatment</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Change treatment"
        description="Current product → alternatives → select → short review → submit change request."
      />

      {step === "current" ? (
        <Card>
          <CardHeader>
            <CardTitle>Current product</CardTitle>
            <CardDescription>
              {selectedProduct?.name ??
                state.activeTreatment?.productName ??
                "No product selected"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Treatment changes require provider approval.
            </p>
            <Button type="button" onClick={() => setStep("alternatives")}>
              View available alternatives
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "alternatives" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {WEIGHT_MANAGEMENT_PRODUCTS.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  className="w-full"
                  variant={
                    state.swapProductId === product.id ? "default" : "outline"
                  }
                  onClick={() => {
                    setSwapProductId(product.id);
                    setStep("review");
                  }}
                >
                  Select
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {step === "review" ? (
        <Card>
          <CardHeader>
            <CardTitle>Short medical review</CardTitle>
            <CardDescription>
              Confirm your requested change before submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Requested product:{" "}
              <strong>
                {
                  WEIGHT_MANAGEMENT_PRODUCTS.find(
                    (item) => item.id === state.swapProductId,
                  )?.name
                }
              </strong>
            </p>
            <p className="text-sm text-muted-foreground">
              A licensed provider must approve this change before it takes
              effect.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("alternatives")}>
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  submitSwap();
                  setStep("done");
                }}
              >
                Submit change request
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
