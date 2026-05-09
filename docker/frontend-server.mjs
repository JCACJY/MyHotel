import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const distRoot = process.env.FRONTEND_DIST_DIR
  ? resolve(process.env.FRONTEND_DIST_DIR)
  : join(currentDir, "dist");
const assetRoot = join(distRoot, "client");
const frontendPort = Number.parseInt(process.env.FRONTEND_PORT || "8080", 10);
const backendUrl = (process.env.BACKEND_URL || "http://127.0.0.1:8081").replace(/\/$/, "");
const worker = (await import(pathToFileURL(join(distRoot, "server", "index.js")))).default;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendStaticFile(requestPath, response) {
  const normalizedPath = normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(assetRoot, normalizedPath);

  if (!filePath.startsWith(assetRoot) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return false;
  }

  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(response);
  return true;
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return chunks.length === 0 ? undefined : Buffer.concat(chunks);
}

async function proxyToBackend(request, response, url) {
  const body = ["GET", "HEAD"].includes(request.method || "GET")
    ? undefined
    : await readRequestBody(request);

  const backendResponse = await fetch(`${backendUrl}${url.pathname}${url.search}`, {
    method: request.method,
    headers: request.headers,
    body,
  });

  const headers = Object.fromEntries(backendResponse.headers.entries());
  delete headers["content-encoding"];
  delete headers["transfer-encoding"];

  response.writeHead(backendResponse.status, headers);
  response.end(Buffer.from(await backendResponse.arrayBuffer()));
}

async function renderFrontend(request, response, url) {
  const workerResponse = await worker.fetch(
    new Request(url, {
      method: request.method,
      headers: request.headers,
      body: ["GET", "HEAD"].includes(request.method || "GET")
        ? undefined
        : await readRequestBody(request),
    }),
    {},
    { waitUntil() {}, passThroughOnException() {} },
  );

  response.writeHead(workerResponse.status, Object.fromEntries(workerResponse.headers.entries()));
  response.end(Buffer.from(await workerResponse.arrayBuffer()));
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (
      url.pathname.startsWith("/api/") ||
      url.pathname === "/api" ||
      url.pathname.startsWith("/h2-console")
    ) {
      await proxyToBackend(request, response, url);
      return;
    }

    if (url.pathname.startsWith("/assets/") && sendStaticFile(url.pathname, response)) {
      return;
    }

    await renderFrontend(request, response, url);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
  }
}).listen(frontendPort, "0.0.0.0", () => {
  console.log(`Frontend server listening on http://0.0.0.0:${frontendPort}`);
  console.log(`Proxying API requests to ${backendUrl}`);
});
