import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseDotenv, setEnvValue, unsetEnvValue } from "../src/core/env.js";

test("parseDotenv supports comments, blanks, plain values, and quotes", () => {
  const env = parseDotenv(`
# comment
OPENAI_API_KEY=sk-test
SPACED="value with spaces"
SINGLE='another value'
URL=postgresql://localhost/db # local database
`);

  assert.equal(env.OPENAI_API_KEY, "sk-test");
  assert.equal(env.SPACED, "value with spaces");
  assert.equal(env.SINGLE, "another value");
  assert.equal(env.URL, "postgresql://localhost/db");
});

test("parseDotenv rejects unsafe env keys", () => {
  assert.throws(() => parseDotenv("BAD-KEY=value"), /invalid env key/);
});

test("setEnvValue and unsetEnvValue update dotenv files safely", async () => {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "aiscope-env-test-"));
  const file = path.join(dir, "scope.env");
  await fs.promises.writeFile(file, "# comment\nOPENAI_API_KEY=old\n");

  await setEnvValue(file, "OPENAI_API_KEY", "sk-new");
  await setEnvValue(file, "DATABASE_URL", "postgresql://localhost/my app");
  let raw = await fs.promises.readFile(file, "utf8");

  assert.match(raw, /OPENAI_API_KEY=sk-new/);
  assert.match(raw, /DATABASE_URL="postgresql:\/\/localhost\/my app"/);

  await unsetEnvValue(file, "OPENAI_API_KEY");
  raw = await fs.promises.readFile(file, "utf8");

  assert.doesNotMatch(raw, /OPENAI_API_KEY=/);
  assert.match(raw, /# comment/);
});
