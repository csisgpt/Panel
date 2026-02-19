const BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:3000";
const TOKEN = process.env.TOKEN;

const checks = [];

function record(name, passed, detail) {
  checks.push({ name, passed, detail });
}

async function parseBody(response) {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

function isEnvelope(body) {
  return Boolean(
    body &&
      typeof body === "object" &&
      typeof body.ok === "boolean" &&
      ("traceId" in body || "trace_id" in body) &&
      "ts" in body
  );
}

async function checkEnvelope(url, init, expectOk) {
  const response = await fetch(url, init);
  const body = await parseBody(response);

  if (!isEnvelope(body)) {
    record(url, false, "Response is not an envelope");
    return;
  }

  if (body.ok !== expectOk) {
    record(url, false, `Expected ok=${expectOk}`);
    return;
  }

  record(url, true);
}

async function run() {
  if (TOKEN) {
    await checkEnvelope(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${TOKEN}` },
    }, true);

    await checkEnvelope(`${BASE_URL}/admin/p2p/withdrawals?page=1&limit=1`, {
      method: "GET",
      headers: { Authorization: `Bearer ${TOKEN}` },
    }, true);
  } else {
    record("/auth/me", true, "Skipped (no TOKEN)");
    record("/admin/p2p/withdrawals", true, "Skipped (no TOKEN)");
  }

  await checkEnvelope(
    `${BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: "", password: "" }),
    },
    false
  );

  const failed = checks.filter((check) => !check.passed);

  checks.forEach((check) => {
    const status = check.passed ? "PASS" : "FAIL";
    const detail = check.detail ? ` - ${check.detail}` : "";
    console.log(`${status}: ${check.name}${detail}`);
  });

  if (failed.length) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("FAIL: smoke-api-contract", error);
  process.exit(1);
});
