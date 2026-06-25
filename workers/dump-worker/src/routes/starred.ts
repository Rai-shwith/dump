import { Hono } from "hono";
import { Env } from "../types";

export function registerStarredRoutes(app: Hono<{ Bindings: Env }>) {
  app.get("/api/starred", (c) => c.json({ message: "not implemented" }, 501));
  app.post("/api/clipboard/:code/star", (c) => c.json({ message: "not implemented" }, 501));
  app.delete("/api/clipboard/:code/star", (c) => c.json({ message: "not implemented" }, 501));
}
