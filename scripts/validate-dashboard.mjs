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
assert.match(html, /You can change your colour palette, exam dates and subject topics here\./);
assert.match(html, /id="appearanceOnboardingStep"/);
assert.match(html, /id="onboardingThemePicker"/);
assert.match(html, /id="editThemePicker"/);
assert.match(html, /id="finishOnboarding"/);
assert.match(html, /theme: state\.theme/);
assert.match(html, /state\.theme = THEME_PRESETS\[savedTheme\]/);
assert.match(html, /LEGACY_THEME_MAP = \{editorial:"graphite",matcha:"olive"\}/);
for (const theme of ["graphite", "rose", "latte", "lavender", "butter", "powder", "peach", "mint", "berry", "olive"]) {
  assert.match(html, new RegExp(`${theme}:\\{name:`));
}
assert.match(html, /\.masthead\{[\s\S]*?background:var\(--theme-dark\);[\s\S]*?color:var\(--on-dark\)/);
assert.match(html, /root\.style\.setProperty\('--ink','#0E0C0C'\)/);
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
const themeStart = appScript.indexOf("const THEME_PRESETS");
const themeEnd = appScript.indexOf("const DEFAULT_EXAMS", themeStart);
assert.ok(themeStart >= 0 && themeEnd > themeStart, "Could not locate theme presets");

const themeContext = {};
vm.runInNewContext(`${appScript.slice(themeStart, themeEnd)}\nglobalThis.themes = THEME_PRESETS;`, themeContext);
assert.equal(Object.keys(themeContext.themes).length, 10);
const luminance = (hex) => {
  const channels = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (left, right) => {
  const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
for (const [key, preset] of Object.entries(themeContext.themes)) {
  assert.ok(contrast("#0E0C0C", preset.colors.paper) >= 7, `${key} body text contrast is too low`);
  assert.ok(contrast("#FFFFFF", preset.colors.surface) >= 4.5, `${key} dark-surface contrast is too low`);
}

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
