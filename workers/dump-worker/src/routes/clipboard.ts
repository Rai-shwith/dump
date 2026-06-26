import { Hono } from "hono";
import { Env } from "../types";
import { handleCreate, handleRead, handleRaw, handleUpdate, handleDelete } from "../handlers/clipboard";

export function registerClipboardRoutes(app: Hono<{ Bindings: Env }>) {
  app.post("/api/clipboard", (c) => handleCreate(c.req.raw, c.env, c.executionCtx));
  app.get("/api/clipboard/:code", (c) => handleRead(c.req.raw, c.env, c.req.param("code")));
  app.get("/api/clipboard/:code/raw", (c) => handleRaw(c.req.raw, c.env, c.req.param("code")));
  app.put("/api/clipboard/:code", (c) => handleUpdate(c.req.raw, c.env, c.req.param("code")));
  app.delete("/api/clipboard/:code", (c) => handleDelete(c.req.raw, c.env, c.req.param("code")));
}
