import test from "node:test";
import assert from "node:assert/strict";
import { parseSimpleToml } from "../src/core/config.js";

test("parseSimpleToml reads aiscope config", () => {
  const config = parseSimpleToml(`
type = "project"
name = "clip-brief"
env = "~/.aiscope/vault/projects/clip-brief.env"
`);

  assert.deepEqual(config, {
    type: "project",
    name: "clip-brief",
    env: "~/.aiscope/vault/projects/clip-brief.env"
  });
});

test("parseSimpleToml rejects unquoted values", () => {
  assert.throws(() => parseSimpleToml("type = project"), /Values must be quoted/);
});
