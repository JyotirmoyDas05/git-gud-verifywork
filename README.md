# git-gud-verifywork

The companion repository for **Git Gud**, a desktop app for learning Git and GitHub.

You fork this repo and practise the real workflow on it: forking, cloning, branching,
adding a collaborator, pushing, opening a pull request, and merging. When your pull
request is merged, your name appears on the wall:

**https://jyotirmoydas05.github.io/git-gud-verifywork/**

---

## What you do here

Five of the eleven Git Gud challenges use this repository:

| Challenge | What you do |
|---|---|
| 6 — Forks and Clones | Fork this repo, clone your fork, add this one as `upstream` |
| 7 — Branches | Branch `add-<yourusername>`, add your file, push |
| 8 — It's a Small World | Add a collaborator to your fork |
| 10 — Requesting You Pull, Please | Open a pull request |
| 11 — Merge, Tada! | Pull the merge down, delete your branch |

The app walks you through each one. You shouldn't need to read this file to finish.

---

## The one rule for your pull request

Your pull request must add **exactly one file**:

```
contributors/add-<yourusername>.txt
```

All lowercase, matching your own GitHub username, and nothing else changed.

Put it directly in `contributors/` — not in a nested folder. Its contents don't matter;
say hello if you like.

A bot checks every pull request and merges it automatically when it fits. If something
is off, it comments on the pull request telling you what to fix, then re-checks on your
next push. No human is waiting on the other end.

---

## How the automation works

Two workflows, no server.

**`merge-contributor-pr.yml`** — on every pull request touching `contributors/`.
Validates the one-file rule, squash-merges, then regenerates `index.html` and
`contributors.json` from the directory. The page is a build artifact, so it can never
drift out of sync with the files.

**`accept-invites.yml`** — every 10 minutes.
[`@gitgud-verifybot`](https://github.com/gitgud-verifybot) accepts pending collaborator
invitations **only** for forks of this repository, declines everything else, and records
each acceptance in `collaborators.json`. The app reads that file to verify challenge 8,
because GitHub's collaborators API requires push access and the app is not signed in.

---

## Files

| Path | What it is |
|---|---|
| `contributors/` | One file per person who finished. The point of the whole thing. |
| `index.html` | **Generated.** Don't edit — `scripts/build-index.mjs` rewrites it. |
| `contributors.json` | **Generated.** The list, for the app to read. |
| `collaborators.json` | **Generated.** Written by the invite bot. |
| `style.css` | The wall's stylesheet. Edit freely. |
| `scripts/build-index.mjs` | Builds the two generated files. No dependencies. |

Run it yourself with `node scripts/build-index.mjs`.
