import test from "node:test";
import assert from "node:assert/strict";
import { parseSimpleToml } from "../src/core/config.js";

test("parseSimpleToml reads aiscope config", () => {
  const config = parseSimpleToml(`
type = "project"
name = "demo-app"
env = "~/.aiscope/vault/projects/demo-app.env"
shared = ["openai", "cloudflare"]
`);

  assert.deepEqual(config, {
    type: "project",
    name: "demo-app",
    env: "~/.aiscope/vault/projects/demo-app.env",
    shared: ["openai", "cloudflare"]
  });
});

test("parseSimpleToml rejects unquoted values", () => {
  assert.throws(() => parseSimpleToml("type = project"), /Values must be quoted/);
});
