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

test("requires headshot folder configuration", async () => {
  const response = await fetch(`${baseUrl}/api/headshots`);

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    error: "Headshot folder is not configured.",
  });
});

test("lists Drive headshots and proxies signed image requests", async () => {
  const folderId = "folder-id-12345";
  const fileId = "image-id-12345";
  const imageBytes = new Uint8Array([137, 80, 78, 71]);
  const upstreamRequests = [];

  process.env.GOOGLE_DRIVE_HEADSHOTS_FOLDER_ID = folderId;
  process.env.GOOGLE_API_KEY = "drive-api-key";
  app.locals.fetch = async (url) => {
    const requestUrl = new URL(url);
    upstreamRequests.push(requestUrl);

    if (requestUrl.pathname === "/drive/v3/files") {
      return {
        ok: true,
        json: async () => ({
          files: [
            { id: fileId, name: "Test Member.jpg", mimeType: "image/jpeg" },
            { id: "document-id-123", name: "Notes", mimeType: "text/plain" },
          ],
        }),
      };
    }

    return {
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "image/jpeg" }),
      arrayBuffer: async () => imageBytes.buffer,
    };
  };

  try {
    const listResponse = await fetch(`${baseUrl}/api/headshots`);
    const data = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.equal(data.headshots.length, 1);
    assert.equal(data.headshots[0].name, "Test Member.jpg");
    assert.match(
      data.headshots[0].url,
      /^\/api\/headshots\/image-id-12345\?signature=/,
    );
    assert.doesNotMatch(data.headshots[0].url, /drive-api-key/);
    assert.equal(
      listResponse.headers.get("cache-control"),
      "public, s-maxage=300, stale-while-revalidate=600",
    );

    const listRequest = upstreamRequests[0];
    assert.equal(listRequest.searchParams.get("key"), "drive-api-key");
    assert.match(listRequest.searchParams.get("q"), /folder-id-12345/);
    assert.equal(listRequest.searchParams.get("supportsAllDrives"), "true");

    const invalidImage = await fetch(
      `${baseUrl}/api/headshots/${fileId}?signature=invalid`,
    );
    assert.equal(invalidImage.status, 404);

    const imageResponse = await fetch(`${baseUrl}${data.headshots[0].url}`);
    assert.equal(imageResponse.status, 200);
    assert.equal(imageResponse.headers.get("content-type"), "image/jpeg");
    assert.deepEqual(
      new Uint8Array(await imageResponse.arrayBuffer()),
      imageBytes,
    );

    const mediaRequest = upstreamRequests[1];
    assert.equal(mediaRequest.pathname, `/drive/v3/files/${fileId}`);
    assert.equal(mediaRequest.searchParams.get("alt"), "media");
  } finally {
    delete app.locals.fetch;
    delete process.env.GOOGLE_DRIVE_HEADSHOTS_FOLDER_ID;
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
