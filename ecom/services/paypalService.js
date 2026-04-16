function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function getPayPalAccessToken() {
  const baseUrl = requireEnv("PAYPAL_BASE_URL");
  const clientId = requireEnv("PAYPAL_CLIENT_ID");
  const clientSecret = requireEnv("PAYPAL_CLIENT_SECRET");

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.access_token;
}

async function paypalCreateOrder({ total, currency = "USD" }) {
  const baseUrl = requireEnv("PAYPAL_BASE_URL");
  const token = await getPayPalAccessToken();

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: total.toFixed(2),
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create-order error: ${res.status} ${text}`);
  }

  return res.json();
}

async function paypalCaptureOrder({ paypalOrderId }) {
  const baseUrl = requireEnv("PAYPAL_BASE_URL");
  const token = await getPayPalAccessToken();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture error: ${res.status} ${text}`);
  }

  return res.json();
}

module.exports = { paypalCreateOrder, paypalCaptureOrder };

