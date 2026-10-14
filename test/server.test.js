const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.VERCEL = "1";

const app = require("../src/server");

let baseUrl;
let server;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("serves the site and health endpoint", async () => {
  const [home, health] = await Promise.all([
    fetch(`${baseUrl}/`),
    fetch(`${baseUrl}/api/health`),
  ]);

  assert.equal(home.status, 200);
  assert.match(await home.text(), /Kappa Theta Pi @ Pitt/);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");
});

test("only exposes the intended worksheet tabs", async () => {
  const unknownSheet = await fetch(`${baseUrl}/api/sheets/Private%20Notes`);
  const allowedSheet = await fetch(`${baseUrl}/api/sheets/Rush`);

  assert.equal(unknownSheet.status, 404);
  assert.deepEqual(await unknownSheet.json(), { error: "Sheet not found" });
  assert.equal(allowedSheet.status, 500);
  assert.deepEqual(await allowedSheet.json(), {
    error: "Server configuration error: Missing API credentials",
  });
});

test("proxies allowed worksheets and sets an edge cache policy", async () => {
  let upstreamUrl;

  process.env.GOOGLE_SHEET_ID = "sheet-id";
  process.env.GOOGLE_API_KEY = "api-key";
  app.locals.fetch = async (url, options) => {
    upstreamUrl = url;
    assert.ok(options.signal instanceof AbortSignal);
    return {
      ok: true,
      json: async () => ({ values: [["Rush"]] }),
    };
  };

  try {
    const response = await fetch(`${baseUrl}/api/sheets/Rush`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { values: [["Rush"]] });
    assert.match(upstreamUrl, /spreadsheets\/sheet-id\/values\/Rush\?key=api-key$/);
    assert.equal(
      response.headers.get("cache-control"),
      "public, s-maxage=300, stale-while-revalidate=600",
    );
  } finally {
    delete app.locals.fetch;
    delete process.env.GOOGLE_SHEET_ID;
    delete process.env.GOOGLE_API_KEY;
  }
});

test("validates contact submissions before calling Resend", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify({ email: "not-an-email" }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Please complete every field.",
  });
});

test("rejects contact submissions from another origin", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://example.com",
    },
    body: "{}",
  });

  assert.equal(response.status, 403);
});

test("sends valid contact submissions through the direct Resend API", async () => {
  let resendRequest;

  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.CONTACT_FROM_EMAIL = "KTP Pitt <contact@ktpatpitt.com>";
  process.env.CONTACT_TO_EMAIL = "upittkappathetapi@gmail.com";
  app.locals.fetch = async (url, options) => {
    resendRequest = { url, options };
    return { ok: true, status: 200 };
  };

  try {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
      },
      body: JSON.stringify({
        name: "Test Member",
        email: "member@example.com",
        subject: "Chapter question",
        message: "Hello from the test suite.",
        website: "",
        submissionId: "3b241101-e2bb-4255-8caf-4136c566a962",
      }),
    });

    assert.equal(response.status, 202);
    assert.equal(resendRequest.url, "https://api.resend.com/emails");
    assert.equal(
      resendRequest.options.headers.Authorization,
      "Bearer test-resend-key",
    );
    assert.equal(
      resendRequest.options.headers["Idempotency-Key"],
      "contact-3b241101-e2bb-4255-8caf-4136c566a962",
    );
    assert.deepEqual(JSON.parse(resendRequest.options.body), {
      from: "KTP Pitt <contact@ktpatpitt.com>",
      to: ["upittkappathetapi@gmail.com"],
      reply_to: "member@example.com",
      subject: "[KTP Website] Chapter question",
      text: "Name: Test Member\nEmail: member@example.com\n\nHello from the test suite.",
      tags: [{ name: "source", value: "website-contact" }],
    });
  } finally {
    delete app.locals.fetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_FROM_EMAIL;
    delete process.env.CONTACT_TO_EMAIL;
  }
});

test("returns a 404 for unknown routes", async () => {
  const response = await fetch(`${baseUrl}/not-a-page`);
  assert.equal(response.status, 404);
});
