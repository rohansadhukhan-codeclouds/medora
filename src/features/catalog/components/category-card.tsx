"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CatalogCategory } from "@/features/catalog/lib/product-utils";

type CategoryCardProps = {
  category: CatalogCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${encodeURIComponent(category.slug)}`}
      className="group block h-full"
    >
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3 text-lg">
            <span>{category.name}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </CardTitle>
          <CardDescription>
            {category.productCount}{" "}
            {category.productCount === 1 ? "product" : "products"}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
