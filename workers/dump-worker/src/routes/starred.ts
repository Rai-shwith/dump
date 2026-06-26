import { Hono } from "hono";
import { Env } from "../types";
import { handleGetStarred, handleStar, handleUnstar } from "../handlers/starred";

export function registerStarredRoutes(app: Hono<{ Bindings: Env }>) {
  app.get("/api/starred", (c) => handleGetStarred(c.req.raw, c.env));
  app.post("/api/clipboard/:code/star", (c) => handleStar(c.req.raw, c.env, c.req.param("code")));
  app.delete("/api/clipboard/:code/star", (c) => handleUnstar(c.req.raw, c.env, c.req.param("code")));
}
