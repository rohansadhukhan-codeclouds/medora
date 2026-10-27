export type AsterMdCheckoutEventName =
  | "checkout_visited"
  | "upsell_offered"
  | "upsell_accepted"
  | "upsell_declined"
  | "order_placed"
  | "order_declined";

export type AsterMdCheckoutUpsellItem = {
  product_id: string;
  product_name: string;
};

export type AsterMdCheckoutEventCard = {
  type: string;
  bin?: string;
  exp?: string;
};

export type AsterMdCheckoutEventPayment = {
  type: string;
  pre_auth: boolean;
  pre_auth_qa: boolean;
  pre_auth_amount: number;
  card?: AsterMdCheckoutEventCard;
};

export type AsterMdCheckoutEventCreateBody = {
  session: string;
  event: AsterMdCheckoutEventName;
  order_value: number;
  order_total: number;
  payment_method: string;
  discount_code?: string;
  currency: string;
  upsell: AsterMdCheckoutUpsellItem[];
};

export type AsterMdCheckoutEventUpdateBody = {
  event: AsterMdCheckoutEventName;
  product_id?: string;
  product_name?: string;
  order_value: number;
  order_total: number;
  payment_method: string;
  currency: string;
  provider_order_id?: string[];
  opportunity_id?: string;
  payment?: AsterMdCheckoutEventPayment;
};

export type AsterMdCheckoutEventRecord = AsterMdCheckoutEventCreateBody &
  AsterMdCheckoutEventUpdateBody & {
    _id?: string;
    id?: string;
    created_at?: string;
  };

export type AsterMdCheckoutEventApiResponse = {
  success?: boolean;
  message?: string;
  data?: AsterMdCheckoutEventRecord | null;
  errors?: unknown;
};
