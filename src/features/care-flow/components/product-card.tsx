"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";
import type { ProductOption } from "@/features/care-flow/types";

type ProductCardProps = {
  product: ProductOption;
};

export function ProductCard({ product }: ProductCardProps) {
  const { selectProduct } = useCareFlow();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium">{product.planLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Pricing</dt>
            <dd className="font-medium">{product.priceLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Variant</dt>
            <dd className="font-medium text-right">{product.dosageLabel}</dd>
          </div>
        </dl>
        <Button asChild className="w-full">
          <Link href="/medical-intake" onClick={() => selectProduct(product.id)}>
            Select
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
