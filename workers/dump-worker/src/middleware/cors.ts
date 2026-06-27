export const ALLOWED_ORIGINS = [
  "https://dump.ashwithrai.me",
  "http://localhost:8080",
];

export function addCorsHeaders(response: Response, requestOrigin: string | null): Response {
  const newResponse = new Response(response.body, response);
  
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
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

export function applyMiddleware(response: Response, requestOrigin: string | null): Response {
  const corsResponse = addCorsHeaders(response, requestOrigin);
  return addSecurityHeaders(corsResponse);
}
