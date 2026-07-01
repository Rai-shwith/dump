export const ALLOWED_ORIGINS = [
  "https://dump.ashwithrai.me",
  "http://localhost:5173",
];

export function addCorsHeaders(
  response: Response,
  requestOrigin: string | null,
  environment?: string
): Response {
  const newResponse = new Response(response.body, response);
  
  const isAllowed = requestOrigin && (
    ALLOWED_ORIGINS.includes(requestOrigin) ||
    (environment === "development" && (
      requestOrigin.startsWith("http://localhost:") ||
      requestOrigin.startsWith("http://127.0.0.1:") ||
      requestOrigin.endsWith(".github.dev") ||
      requestOrigin.endsWith(".gitpod.io")
    ))
  );

  if (requestOrigin && isAllowed) {
    newResponse.headers.set("Access-Control-Allow-Origin", requestOrigin);
    newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Owner-Token, X-Clipboard-Password");
    newResponse.headers.set("Vary", "Origin");
  }
  
  return newResponse;
}

export function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("Referrer-Policy", "no-referrer");
  newResponse.headers.set("Content-Security-Policy", "default-src 'none'");
  
  return newResponse;
}

export function applyMiddleware(
  response: Response,
  requestOrigin: string | null,
  environment?: string
): Response {
  const corsResponse = addCorsHeaders(response, requestOrigin, environment);
  return addSecurityHeaders(corsResponse);
}
