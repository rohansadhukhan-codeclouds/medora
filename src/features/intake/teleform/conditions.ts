import type {
  NormalizedTeleformField,
  NormalizedTeleformSection,
  TeleformCondition,
  TeleformValues,
} from "@/features/intake/teleform/types";

/**
 * Condition evaluation adapter.
 *
 * Current AsterMD payloads use empty `conditions: []`.
 * Operator semantics are PENDING — do not invent rules.
 * Empty / missing conditions → visible.
 */
export function evaluateConditions(
  conditions: TeleformCondition[] | undefined,
  answers: TeleformValues,
): boolean {
  void answers;
  if (!conditions || conditions.length === 0) return true;

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[teleform] Unsupported non-empty conditions — field/page left visible (PENDING semantics).",
      conditions.length,
    );
  }

  // Fail-open until AsterMD condition operators are documented.
  return true;
}

export function shouldRenderPage(
  page: NormalizedTeleformSection,
  answers: TeleformValues,
): boolean {
  return evaluateConditions(page.conditions, answers);
}

export function shouldRenderField(
  field: NormalizedTeleformField,
  answers: TeleformValues,
): boolean {
  return evaluateConditions(field.conditions, answers);
}
