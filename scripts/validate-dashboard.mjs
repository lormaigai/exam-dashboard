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
assert.match(html, /You can change your colour pairing, exam dates and subject topics here\./);
assert.match(html, /id="appearanceOnboardingStep"/);
assert.match(html, /id="finishOnboarding"/);
for (const id of ["onboardingPrimaryColour", "onboardingSecondaryColour", "editPrimaryColour", "editSecondaryColour"]) {
  assert.match(html, new RegExp(`type="color" id="${id}"`));
}
assert.match(html, /id="onboardingRestoreOriginal"/);
assert.match(html, /id="editRestoreOriginal"/);
assert.match(html, /appearance: state\.appearance/);
assert.match(html, /delete merged\.theme/);
assert.match(html, /if\(loadedRaw\.theme\)\{ dataWasSanitized=true; \}/);
assert.match(html, /ORIGINAL_APPEARANCE = \{custom:false, primary:"#F7F4ED", secondary:"#1A2332"\}/);
assert.match(html, /\.masthead\{[\s\S]*?background:var\(--theme-dark\);[\s\S]*?color:var\(--on-dark\)/);
assert.match(html, /const bodyText=readableText\(primary\), panelText=readableText\(secondary\)/);
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
assert.match(html, /\{date:"2026-08-04", name:"Geography CBA2", subj:"GEOG"\}/);
assert.match(html, /exam\.name === "Geography CBA2" && exam\.date === "2026-08-03"/);

const deployWorkflow = fs.readFileSync(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");
assert.match(deployWorkflow, /cp index\.html _site\/404\.html/);

const appScript = inlineScripts[0];
const appearanceStart = appScript.indexOf("function isHexColour");
const appearanceEnd = appScript.indexOf("function applyAppearance", appearanceStart);
assert.ok(appearanceStart >= 0 && appearanceEnd > appearanceStart, "Could not locate appearance helpers");
const appearanceContext = {};
vm.runInNewContext(`${appScript.slice(appearanceStart, appearanceEnd)}
  globalThis.result = {
    valid: isHexColour("#A1b2C3"), invalid: isHexColour("pink"),
    mixed: mixColours("#000000", "#FFFFFF", 0.5),
    onLight: readableText("#FFC0CB"), onDark: readableText("#315C45")
  };`, appearanceContext);
assert.deepEqual({ ...appearanceContext.result }, { valid:true, invalid:false, mixed:"#808080", onLight:"#0E0C0C", onDark:"#FFFFFF" });

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
