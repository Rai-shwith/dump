import { Hono } from "hono";
import { Env } from "../types";
import { handleCreate, handleRead, handleUpdate } from "../handlers/clipboard";

export function registerClipboardRoutes(app: Hono<{ Bindings: Env }>) {
  app.post("/api/clipboard", (c) => handleCreate(c.req.raw, c.env, c.executionCtx));
  app.get("/api/clipboard/:code", (c) => handleRead(c.req.raw, c.env, c.req.param("code")));
  app.get("/api/clipboard/:code/raw", (c) => c.json({ message: "not implemented" }, 501));
  app.put("/api/clipboard/:code", (c) => handleUpdate(c.req.raw, c.env, c.req.param("code")));
  app.delete("/api/clipboard/:code", (c) => c.json({ message: "not implemented" }, 501));
}
