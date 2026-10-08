import "server-only";
import type {
  AsterMdChannelDetail,
  AsterMdChannelDetailApiResponse,
} from "@/lib/api/astermd/channel-types";

/**
 * Demo channel catalog for local UI when ASTERMD_USE_MOCK=true.
 * Not real PHI / not a live AsterMD response.
 */
export const MOCK_CHANNEL_DETAIL: AsterMdChannelDetail = {
  _id: "channel_mock_medora",
  name: "Medora Demo Channel",
  description: "Mock catalog used while AsterMD live credentials are unavailable.",
  status: 1,
  type: "storefront",
  products: [
    {
      _id: "cp_mock_001",
      channel_id: "channel_mock_medora",
      product_id: "prod_mock_weight",
      product: {
        _id: "prod_mock_weight",
        product_id: "prod_mock_weight",
        name: "Weight Management Program",
        description_short:
          "Clinician-guided weight care with ongoing check-ins.",
        description_long:
          "A structured weight management pathway including eligibility review, provider consult, and follow-up messaging.",
        type: "program",
        image: undefined,
        stock: 100,
        categories: [{ _id: "cat_weight", name: "Weight Care" }],
        condition_treated: [{ _id: "cond_obesity", name: "Weight management" }],
        variants: [
          {
            _id: "var_weight_monthly",
            name: "Monthly",
            default_price: 19900,
            intro_price: 9900,
          },
        ],
      },
    },
    {
      _id: "cp_mock_002",
      channel_id: "channel_mock_medora",
      product_id: "prod_mock_skin",
      product: {
        _id: "prod_mock_skin",
        product_id: "prod_mock_skin",
        name: "Dermatology Consult",
        description_short: "Virtual dermatology visit for common skin concerns.",
        description_long:
          "Upload photos, complete a short intake, and meet a licensed clinician for a personalized care plan.",
        type: "consult",
        stock: 50,
        categories: [{ _id: "cat_derm", name: "Skin" }],
        condition_treated: [{ _id: "cond_acne", name: "Acne" }],
        variants: [
          {
            _id: "var_derm_once",
            name: "Single visit",
            default_price: 7900,
          },
        ],
      },
    },
    {
      _id: "cp_mock_003",
      channel_id: "channel_mock_medora",
      product_id: "prod_mock_mental",
      product: {
        _id: "prod_mock_mental",
        product_id: "prod_mock_mental",
        name: "Mental Health Check-in",
        description_short: "Short-term mental health support with a licensed provider.",
        description_long:
          "Private video visits focused on anxiety, stress, and sleep concerns with clear next steps.",
        type: "consult",
        stock: 40,
        categories: [{ _id: "cat_mental", name: "Mental Health" }],
        condition_treated: [{ _id: "cond_anxiety", name: "Anxiety" }],
        variants: [
          {
            _id: "var_mental_4wk",
            name: "4-week plan",
            default_price: 14900,
            sale_price: 12900,
          },
        ],
      },
    },
    {
      _id: "cp_mock_004",
      channel_id: "channel_mock_medora",
      product_id: "prod_mock_mens",
      product: {
        _id: "prod_mock_mens",
        product_id: "prod_mock_mens",
        name: "Men's Health Essentials",
        description_short: "Confidential men's health evaluation and treatment options.",
        description_long:
          "Eligibility screening, clinician review, and treatment options delivered through your care portal.",
        type: "program",
        stock: 75,
        categories: [{ _id: "cat_mens", name: "Men's Health" }],
        condition_treated: [{ _id: "cond_mens", name: "Men's health" }],
        variants: [
          {
            _id: "var_mens_monthly",
            name: "Monthly",
            default_price: 8900,
          },
        ],
      },
    },
    {
      _id: "cp_mock_005",
      channel_id: "channel_mock_medora",
      product_id: "prod_mock_hair",
      product: {
        _id: "prod_mock_hair",
        product_id: "prod_mock_hair",
        name: "Hair Loss Treatment",
        description_short: "Personalized hair loss care after clinical review.",
        description_long:
          "Photo-based intake, clinician assessment, and ongoing treatment plan if medically appropriate.",
        type: "program",
        stock: 60,
        categories: [{ _id: "cat_hair", name: "Hair" }],
        condition_treated: [{ _id: "cond_hair", name: "Hair loss" }],
        variants: [
          {
            _id: "var_hair_quarterly",
            name: "Quarterly",
            default_price: 12900,
          },
        ],
      },
    },
    {
      _id: "cp_mock_006",
      channel_id: "channel_mock_medora",
      product_id: "prod_mock_sleep",
      product: {
        _id: "prod_mock_sleep",
        product_id: "prod_mock_sleep",
        name: "Sleep Support Program",
        description_short: "Clinician-guided support for ongoing sleep issues.",
        description_long:
          "Intake focused on sleep patterns, clinician review, and a care plan tailored to your goals.",
        type: "program",
        stock: 55,
        categories: [{ _id: "cat_sleep", name: "Sleep" }],
        condition_treated: [{ _id: "cond_insomnia", name: "Insomnia" }],
        variants: [
          {
            _id: "var_sleep_monthly",
            name: "Monthly",
            default_price: 9900,
            intro_price: 6900,
          },
        ],
      },
    },
  ],
};

export function getMockChannelDetailResponse(): AsterMdChannelDetailApiResponse {
  return {
    success: true,
    message: "Mock channel detail",
    data: structuredClone(MOCK_CHANNEL_DETAIL),
  };
}
