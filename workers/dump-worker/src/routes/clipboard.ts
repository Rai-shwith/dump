import { Hono } from "hono";
import { Env } from "../types";

export function registerClipboardRoutes(app: Hono<{ Bindings: Env }>) {
  app.post("/api/clipboard", (c) => c.json({ message: "not implemented" }, 501));
  app.get("/api/clipboard/:code", (c) => c.json({ message: "not implemented" }, 501));
  app.get("/api/clipboard/:code/raw", (c) => c.json({ message: "not implemented" }, 501));
  app.put("/api/clipboard/:code", (c) => c.json({ message: "not implemented" }, 501));
  app.delete("/api/clipboard/:code", (c) => c.json({ message: "not implemented" }, 501));
}
