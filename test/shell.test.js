import test from "node:test";
import assert from "node:assert/strict";
import { activationScript, deactivationScript } from "../src/core/shell.js";

test("activationScript unsets previous keys and exports quoted values", () => {
  const script = activationScript({
    config: {
      type: "project",
      name: "demo",
      envPath: "/tmp/demo.env",
      configPath: "/tmp/.aiscope.toml"
    },
    env: {
      OPENAI_API_KEY: "sk-'quoted'",
      DATABASE_URL: "postgres://local/db"
    },
    previousKeys: ["OLD_KEY"],
    previousScope: "project/old"
  });

  assert.match(script, /unset OLD_KEY/);
  assert.match(script, /export OPENAI_API_KEY='sk-'/);
  assert.match(script, /export AISCOPE_SCOPE='project\/demo'/);
  assert.match(script, /export AISCOPE_LOADED_KEYS='OPENAI_API_KEY DATABASE_URL'/);
});

test("deactivationScript clears aiscope metadata", () => {
  const script = deactivationScript({ previousKeys: ["OPENAI_API_KEY"], previousScope: "project/demo" });

  assert.match(script, /unset OPENAI_API_KEY/);
  assert.match(script, /unset AISCOPE_ACTIVE/);
  assert.match(script, /aiscope: unloaded project\/demo/);
});
