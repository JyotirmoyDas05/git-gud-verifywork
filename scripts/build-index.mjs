#!/usr/bin/env node
//
// Regenerates index.html and contributors.json from the contributors/ directory.
//
// index.html is a build artifact, never hand-edited. The original Patchwork let
// a hosted bot rewrite it directly, so the page and the directory could drift
// apart; deriving it here means they cannot.
//
// No dependencies on purpose — this runs in CI on every merged PR, and a
// template engine would mean an npm install for ~40 lines of string building.

import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";

const REPO = "JyotirmoyDas05/git-gud-verifywork";
const SHOWN = 100;

/** Map every contributors/*.txt to the ISO date its adding commit landed. */
function addedDates() {
  // One `git log` pass rather than one per file: at a few thousand
  // contributors, per-file log calls take minutes.
  const raw = execFileSync(
    "git",
    [
      "log",
      "--diff-filter=A",
      "--name-only",
      "--date=iso-strict",
      "--format=@%aI",
      "--",
      "contributors",
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

  const dates = new Map();
  let current = null;

  for (const line of raw.split("\n")) {
    const text = line.trim();
    if (!text) continue;
    if (text.startsWith("@")) {
      current = text.slice(1);
    } else if (current && !dates.has(text)) {
      // First sighting wins: git log is newest-first, so a file re-added
      // after a delete keeps its most recent add.
      dates.set(text, current);
    }
  }

  return dates;
}

function usernameOf(filename) {
  return filename.replace(/^add-/i, "").replace(/\.txt$/i, "");
}

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

const files = readdirSync("contributors").filter((f) => /^add-.+\.txt$/i.test(f));
const dates = addedDates();

const contributors = files
  .map((file) => ({
    username: usernameOf(file),
    at: dates.get(`contributors/${file}`) ?? null,
  }))
  // Newest first; anything with no recorded date sorts last.
  .sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));

writeFileSync(
  "contributors.json",
  `${JSON.stringify({ total: contributors.length, contributors }, null, 2)}\n`,
);

const recent = contributors.slice(0, SHOWN);

const list = recent
  .map(
    (c) =>
      `          <li><span class="userdetail"><a href="https://github.com/${encodeURIComponent(
        c.username,
      )}" target="_blank" rel="noopener">@${escapeHtml(c.username)}</a></span>` +
      ` <span class="userdate">${escapeHtml(c.at ?? "")}</span></li>`,
  )
  .join("\n");

const empty = `
        <p class="empty">No one yet. Be the first — finish the challenges in
        <a href="https://github.com/${REPO}" target="_blank" rel="noopener">Git Gud</a>.</p>`;

const html = `<!doctype html>
<html class="no-js" lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Git Gud — learn Git and GitHub by doing.">
    <title>Git Gud: Git, GitHub and the Pursuit of Open Source</title>
    <link href="style.css" rel="stylesheet">
  </head>
  <body>
    <div class="large-container">
      <div id="welcome-name">
        <h1>Congrats, you did it!</h1>
      </div>
    </div>

    <div class="container">
      <h2>You <strong>pull request</strong> with the best of 'em.</h2>
      <h3>You now know alternate meanings for the words <strong>fork</strong> and
        <strong>branch</strong>, and you've <strong>collaborated</strong> with someone
        (or a robot) elsewhere. Below are the last ${SHOWN} to have finished.</h3>

      <div id="compatriots">
${recent.length ? `        <ul class="compatriots-list">\n${list}\n        </ul>` : empty}
      </div>

      <div class="textcontainer">
        <div id="about" class="halvsies">
          <h4>That's not all!</h4>
          <div class="totalwow">${contributors.length.toLocaleString("en-US")}</div>
          <p>people have finished <a href="https://github.com/${REPO}" target="_blank" rel="noopener">Git Gud</a>,
            an open source app for learning Git and GitHub.</p>
          <p>The challenges are self-directed, so you can work through them on your own —
            but they also make for a good workshop.</p>
        </div>

        <div id="next" class="halvsies">
          <h4>What next?</h4>
          <p>Don't stop now. Some ideas for what to work on:</p>
          <ul class="what-next-list">
            <li>Make a repository named <code>yourusername.github.io</code>, fill it with
              web files, and GitHub will host it free at that address.</li>
            <li>Open an issue in one of your repositories and create a
              <a href="https://docs.github.com/get-started/writing-on-github/working-with-advanced-formatting/about-task-lists" target="_blank" rel="noopener">task list</a>.</li>
            <li>Find projects to work with in <a href="https://github.com/explore" target="_blank" rel="noopener">Explore</a>.</li>
            <li>Read the GitHub <a href="https://docs.github.com/get-started/start-your-journey/hello-world" target="_blank" rel="noopener">Hello World guide</a>.</li>
          </ul>
        </div>
      </div>
    </div>
  </body>
</html>
`;

writeFileSync("index.html", html);
console.log(`Built index.html and contributors.json — ${contributors.length} contributor(s).`);
