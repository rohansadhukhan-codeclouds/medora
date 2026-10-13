/**
 * Manual smoke checks for schema-driven teleform helpers.
 * Run: npx tsx src/features/intake/teleform/smoke-checks.ts
 * (No project test runner configured yet.)
 */
import { shouldRenderField, shouldRenderPage } from "@/features/intake/teleform/conditions";
import { normalizeTeleformJson } from "@/features/intake/teleform/normalize-teleform";
import { normalizeOptions } from "@/features/intake/teleform/options";
import { parseImageSources } from "@/features/intake/teleform/parse-image-sources";
import { validateField } from "@/features/intake/teleform/validation";

const form = normalizeTeleformJson({
  formId: "f1",
  formName: "Test",
  version: 1,
  settings: { accentColor: "#14b8a6", injectJs: "alert(1)", showProgressBar: true },
  pages: [
    {
      pageId: "p2",
      title: "Second",
      order: 2,
      fields: [
        {
          fieldId: "t1",
          type: "text",
          name: "first_name",
          label: "FIRST NAME",
          required: true,
          order: 1,
          validation: { errorMessages: { minLength: "2" } },
          properties: { cols: 2 },
        },
      ],
    },
    {
      pageId: "p1",
      title: "First",
      order: 0,
      fields: [
        {
          fieldId: "h1",
          type: "form-header",
          name: "form_header_2",
          label: "Form Header",
          order: 0,
          properties: {
            formHeaderMode: "logo",
            formHeaderLogoUrl: "data:image/png;base64,AAA",
          },
        },
        {
          fieldId: "c1",
          type: "choice-multi",
          name: "symptoms",
          label: "Q",
          required: true,
          order: 2,
          properties: { multiSelect: false, options: ["A", "B"], cols: 1 },
        },
        {
          fieldId: "img",
          type: "image",
          name: "image_6",
          label: "Image",
          order: 3,
          properties: {
            imageUrl:
              "data:image/avif;base64,AAA\ndata:image/avif;base64,BBB",
          },
        },
        {
          fieldId: "unk",
          type: "future-widget",
          name: "x",
          label: "X",
          order: 4,
          properties: {},
        },
      ],
    },
  ],
});

const firstName = form.sections[1].fields[0];
const checks: Array<[string, boolean]> = [
  ["pages sorted", form.sections[0].order === 0 && form.sections[1].order === 2],
  ["fields sorted", form.sections[0].fields[0].type === "form_header"],
  [
    "choice multiSelect false",
    form.sections[0].fields.find((f) => f.name === "symptoms")?.meta
      ?.multiSelect === false,
  ],
  [
    "minLength from errorMessages",
    Boolean(validateField(firstName, { first_name: "A" })?.includes("2")),
  ],
  [
    "email invalid",
    Boolean(
      validateField(
        { ...firstName, type: "email", name: "email" },
        { email: "bad" },
      ),
    ),
  ],
  [
    "options normalize",
    normalizeOptions(["Male", { label: "Female", value: "f" }]).length === 2,
  ],
  [
    "images split",
    parseImageSources(
      "data:image/avif;base64,AAA\ndata:image/avif;base64,BBB",
    ).length === 2,
  ],
  [
    "empty conditions true",
    shouldRenderPage(form.sections[0], {}) &&
      shouldRenderField(form.sections[0].fields[0], {}),
  ],
  [
    "unknown type",
    form.sections[0].fields.find((f) => f.name === "x")?.type === "unknown",
  ],
  [
    "injectJs not exposed",
    form.settings?.injectJsIgnored === true &&
      !("injectJs" in (form.settings || {})),
  ],
];

let failed = 0;
for (const [name, ok] of checks) {
  // eslint-disable-next-line no-console
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) process.exit(1);
