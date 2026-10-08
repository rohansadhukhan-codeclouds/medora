"use client";

import Link from "next/link";
import { Heart, Leaf, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";
import type { TreatmentCategory } from "@/features/care-flow/types";

const icons = {
  scale: Scale,
  sparkles: Sparkles,
  heart: Heart,
  leaf: Leaf,
};

type TreatmentCardProps = {
  treatment: TreatmentCategory;
};

export function TreatmentCard({ treatment }: TreatmentCardProps) {
  const { selectTreatment } = useCareFlow();
  const Icon = icons[treatment.icon];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-muted text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{treatment.name}</CardTitle>
          {!treatment.available ? <Badge variant="muted">Coming soon</Badge> : null}
        </div>
        <CardDescription>{treatment.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        {treatment.available ? (
          <Button asChild className="w-full">
            <Link
              href="/eligibility"
              onClick={() => selectTreatment(treatment.id)}
            >
              Get Started
            </Link>
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            Not available in demo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
