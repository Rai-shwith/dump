import { Hono } from "hono";
import { Env } from "./types";
import { registerClipboardRoutes } from "./routes/clipboard";
import { registerStarredRoutes } from "./routes/starred";
import { applyMiddleware } from "./middleware/cors";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  if (c.req.method === "OPTIONS") {
    c.res = applyMiddleware(new Response(null, { status: 200 }), c.req.header("Origin") || null);
    return;
  }
  await next();
  c.res = applyMiddleware(c.res, c.req.header("Origin") || null);
});

registerClipboardRoutes(app);
registerStarredRoutes(app);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
