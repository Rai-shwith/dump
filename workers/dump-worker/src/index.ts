import { Hono } from "hono";
import { Env } from "./types";
import { registerClipboardRoutes } from "./routes/clipboard";
import { registerStarredRoutes } from "./routes/starred";

const app = new Hono<{ Bindings: Env }>();

registerClipboardRoutes(app);
registerStarredRoutes(app);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
