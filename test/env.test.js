import test from "node:test";
import assert from "node:assert/strict";
import { parseDotenv } from "../src/core/env.js";

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
