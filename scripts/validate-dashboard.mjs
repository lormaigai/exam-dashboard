import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((source) => source.trim());

assert.equal(inlineScripts.length, 1, "Expected one inline application script");
new Function(inlineScripts[0]);

assert.match(html, /options:\s*\{\s*emailRedirectTo:\s*APP_URL\s*\}/);
assert.match(html, /resetPasswordForEmail\(email,\s*\{\s*redirectTo:\s*APP_URL\s*\}\)/);
assert.match(html, /Email verified successfully/);

const appScript = inlineScripts[0];
const helperStart = appScript.indexOf("const SUBJECT_NAME_ALIASES");
const helperEnd = appScript.indexOf("/* ============================================================\n   STORAGE", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, "Could not locate curriculum deduplication helpers");

const context = {};
vm.runInNewContext(`${appScript.slice(helperStart, helperEnd)}
  globalThis.testResult = (() => {
    const subjects = {
      EL: { name: "English Language" },
      OLD_EL: { name: "English" },
      BIO: { name: "Biology" },
      CUSTOM: { name: "Music" }
    };
    const topics = {
      EL: [{ items: [{ text: "Situational writing" }] }],
      OLD_EL: [],
      BIO: [{ items: [{ text: "Genetics" }] }],
      CUSTOM: []
    };
    const changed = removeEmptySubjectDuplicates(subjects, topics);
    return { changed, subjects: Object.keys(subjects), topics: Object.keys(topics) };
  })();`, context);

assert.equal(context.testResult.changed, true);
assert.deepEqual(Array.from(context.testResult.subjects), ["EL", "BIO", "CUSTOM"]);
assert.deepEqual(Array.from(context.testResult.topics), ["EL", "BIO", "CUSTOM"]);

console.log("Dashboard validation passed");
