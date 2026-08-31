import CryptoJS from "crypto-js";

// ---- eSewa UAT (test) config ----------------------------------------
// This secret key is eSewa's publicly documented UAT test key — safe to
// ship client-side ONLY in test mode. Replace productCode/secretKey and
// move signature generation to a backend before going to production.
export const ESEWA_CONFIG = {
  formUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  statusCheckUrl: "https://rc.esewa.com.np/api/epay/transaction/status",
  productCode: "EPAYTEST",
 secretKey: "8gBm/:&EnhH.1/q",
  successUrl: `${window.location.origin}/payment/esewa/success`,
  failureUrl: `${window.location.origin}/payment/esewa/failure`,
};

export interface EsewaPaymentInput {
  amount: number;
  taxAmount?: number;
  productServiceCharge?: number;
  productDeliveryCharge?: number;
  transactionUuid: string; // must be unique per attempt — alphanumeric + hyphen only
}

// Rounds to 2 decimal places and returns a clean string with no floating
// point noise (e.g. 24.990000000000002 -> "24.99", 30 -> "30.00" would be
// wrong for eSewa's plain examples, so we strip a trailing ".00" too).
function formatAmount(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  // Use up to 2 decimals, but drop trailing zeros/decimal point entirely
  // when the value is a whole number (matches eSewa's own examples like
  // "100", "110" rather than "100.00").
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2);
}

function generateSignature(totalAmount: string, transactionUuid: string, productCode: string): string {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hash = CryptoJS.HmacSHA256(message, ESEWA_CONFIG.secretKey);
  return CryptoJS.enc.Base64.stringify(hash);
}

/**
 * Builds eSewa's required hidden form, appends it to the page, and submits
 * it — this redirects the browser straight to eSewa's login page.
 */
export function payWithEsewa(input: EsewaPaymentInput) {
  const amount = formatAmount(input.amount);
  const taxAmount = formatAmount(input.taxAmount ?? 0);
  const productServiceCharge = formatAmount(input.productServiceCharge ?? 0);
  const productDeliveryCharge = formatAmount(input.productDeliveryCharge ?? 0);

  const totalAmountNumber =
    Number(amount) + Number(taxAmount) + Number(productServiceCharge) + Number(productDeliveryCharge);
  const totalAmount = formatAmount(totalAmountNumber);

  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signature = generateSignature(totalAmount, input.transactionUuid, ESEWA_CONFIG.productCode);

  const fields: Record<string, string> = {
    amount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    transaction_uuid: input.transactionUuid,
    product_code: ESEWA_CONFIG.productCode,
    product_service_charge: productServiceCharge,
    product_delivery_charge: productDeliveryCharge,
    success_url: ESEWA_CONFIG.successUrl,
    failure_url: ESEWA_CONFIG.failureUrl,
    signed_field_names: signedFieldNames,
    signature,
  };

  console.log("eSewa payload:", fields); // helpful while debugging — remove later

  const form = document.createElement("form");
  form.method = "POST";
  form.action = ESEWA_CONFIG.formUrl;

  Object.entries(fields).forEach(([name, value]) => {
    const field = document.createElement("input");
    field.type = "hidden";
    field.name = name;
    field.value = value;
    form.appendChild(field);
  });

  document.body.appendChild(form);
  form.submit();
}

export interface EsewaSuccessResponse {
  transaction_code: string;
  status: string;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
}

/** Decodes the base64 `?data=` param eSewa appends to your success_url. */
export function decodeEsewaResponse(base64Data: string): EsewaSuccessResponse | null {
  try {
    const jsonStr = atob(base64Data);
    return JSON.parse(jsonStr) as EsewaSuccessResponse;
  } catch (error) {
    console.error("Error decoding eSewa response:", error);
    return null;
  }
}

/** Confirms the response wasn't tampered with in transit. */
export function verifyEsewaSignature(response: EsewaSuccessResponse): boolean {
  const fieldNames = response.signed_field_names.split(",");
  const message = fieldNames
    .map((field) => `${field}=${(response as unknown as Record<string, unknown>)[field]}`)
    .join(",");

  const hash = CryptoJS.HmacSHA256(message, ESEWA_CONFIG.secretKey);
  const expectedSignature = CryptoJS.enc.Base64.stringify(hash);

  return expectedSignature === response.signature;
}

/** Falls back on this if the browser never returns from eSewa within ~5 min. */
export async function checkEsewaStatus(productCode: string, totalAmount: number, transactionUuid: string) {
  const url = `${ESEWA_CONFIG.statusCheckUrl}/?product_code=${productCode}&total_amount=${totalAmount}&transaction_uuid=${transactionUuid}`;
  const response = await fetch(url);
  return response.json();
}