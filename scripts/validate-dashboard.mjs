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
assert.match(html, /The confirmation-email limit has been reached/);
assert.match(html, /window\.location\.hostname\.endsWith\("github\.io"\)/);

// Subject onboarding and per-account preferences must remain present together.
assert.match(html, /id="subjectOnboarding"/);
assert.match(html, /id="changeSubjectsBtn"/);
assert.match(html, /id="editCoach"/);
assert.match(html, /You can edit your exam dates and subject topics here\./);
assert.match(html, /\{name:"Sciences", codes:\["BIO","CHEM","PHY"\]\}/);
assert.match(html, /\{name:"Humanities", codes:\["GEOG","HIST","LIT","INA"\]\}/);
assert.match(html, /\{name:"Languages", codes:\["EL","HCL","SPA"\]\}/);
assert.match(html, /\{name:"Maths", codes:\["MA1","MA2"\]\}/);
assert.match(html, /\$\{LS_KEY\}:\$\{currentUser\.id\}/);
assert.match(html, /state\.activeSubjects = selected/);

// Curriculum source checks: these labels come directly from the supplied PDFs.
assert.match(html, /The Art of the Short Story/);
assert.match(html, /A Doll's House/);
assert.match(html, /My Mother Pattu/);
assert.match(html, /Treaty of Versailles: conflicting interests of the Big Three/);
assert.match(html, /Cuban Missile Crisis/);
assert.match(html, /Cold War Expands into Asia \(1945-1969\)/);

const deployWorkflow = fs.readFileSync(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");
assert.match(deployWorkflow, /cp index\.html _site\/404\.html/);

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
