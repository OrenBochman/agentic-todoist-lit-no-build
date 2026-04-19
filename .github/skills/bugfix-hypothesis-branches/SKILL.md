---
name: bugfix-hypothesis-branches
description: Use blackboard state, Ishikawa hypotheses, git hypothesis branches, and counterfactual notes to debug regressions systematically while preserving lessons from reverted patches.
---

## Feature Branch Workflow with Reversion and Merging

1. Create a task (feature) branch  
   `git checkout main` → `git pull` → `git checkout -b bugfix-B`  
   This branch holds the reproducible bug, evolving blackboard state, and only durable memory + final fix.
2. Create a hypothesis branch  
   `git checkout -b bugfix-B-H1`  
   Then commit: `git commit -m "cf: H1 hypothesis + expectations"` and `git commit -m "exp: patch for H1"`
3. Evaluate the patch  
   Run tests / repro → classify as success or failure.
4. Revert failed patch (keep learning, discard code)  
   Return: `git checkout bugfix-B`  
   If needed: `git revert <commit-hash>`  
   Record learning: `git commit -m "cf: H1 failed - reason + constraints"`  
   (Code is reverted, knowledge is preserved.)
5. Repeat for next hypothesis  
   `git checkout -b bugfix-B-H2`  
   Then repeat: hypothesis → patch → test → revert or merge.
6. Merge winning hypothesis  
   `git checkout bugfix-B` → `git merge bugfix-B-Hk` → `git commit -m "fix: apply successful hypothesis Hk"`
7. Merge task branch to main  
   `git checkout main` → `git merge bugfix-B`

## Minimal mental model

- main → stable history  
- bugfix-B → task + memory  
- bugfix-B-Hk → isolated experiment  

## Invariants

- never merge failed hypotheses  
- always preserve counterfactual learning  
- only merge validated fixes  
- keep patches small and reversible  


## Purpose

Use this skill to debug a bug or regression by treating each candidate explanation as a falsifiable hypothesis.

The workflow keeps three things synchronized:

1. a **blackboard** for current state, hypotheses, and progress
2. a **counterfactual note** for lessons from failed patches
3. a **git history** shaped around a bugfix branch and per-hypothesis branches

This skill is designed for iterative coding agents with limited context windows. Keep notes compact, concrete, and directly useful for the next patch.

## Use when

Use this skill when:

- a bug has multiple plausible causes
- several subsystems or entities may contribute
- the first attempted patch is unlikely to be the last
- failed patches contain useful information worth preserving
- you want a visible audit trail of diagnosis, rollback, and progress

Avoid this skill when:

- the fix is already obvious and one small patch will do
- the task is pure refactoring with no meaningful uncertainty
- there is no test, repro, or observable failure condition


## Assets (Template Files)

- The files under `assets/` are **templates**. When starting a new bugfix or regression workflow, **copy these files to the `/memory/` folder** in your project root and update them there.
   - Use `/memory/blackboard.md` for your evolving blackboard state.
   - Use `/memory/counterfactual-note.md` for your counterfactual notes for a specific bugfix effort and clear it for the next one.
   - Use `/memory/api-breaking-changes.md` to keep track of any API changes or misunderstandings that were uncovered during the coding process, so you can avoid them in the future.

**Do not edit the templates in `assets/` directly.**

## Required behavior

### 1. Build the issue model first

Open `assets/blackboard.md` and update the Ishikawa chart.

For the current bug:

- name the issue clearly
- list contributing entities or subsystems
- attach a short failure-condition hypothesis to each leaf
- prefer concrete observable hypotheses over vague labels

Good:
- `cache returns stale derived state after route change`
- `listener not unsubscribed causing duplicate event dispatch`

Bad:
- `state issue`
- `frontend weirdness`

### 2. Create and maintain the git progress chart

In `blackboard.md`, maintain a `gitGraph` showing:

- the stable base
- the bugfix branch
- one branch per hypothesis
- whether each attempt failed, partially succeeded, or won
- where memory was updated
- where failed patch effects were reverted

The graph is not decoration. It is a compact control panel for the debugging campaign.

### 3. Create the bugfix branch

Create a feature branch for the task, for example:

- `bugfix-B`
- `bugfix-login-timeout`
- `bugfix-race-condition-cache-invalidation`

On that branch, establish:

- current repro
- task scope
- current blackboard state
- current best-ranked hypotheses

### 4. Pick the next most likely hypothesis

Choose the next hypothesis by expected value, using:

- strength of evidence
- locality of likely fix
- blast radius
- testability
- reversibility

Prefer hypotheses that are:

- easy to falsify
- likely to explain the observed failure
- cheap to test
- low-risk to patch

### 5. Create a hypothesis branch

For hypothesis `Hk`, create a branch such as:

- `bugfix-B-H1`
- `bugfix-B-H2`

On that branch, make two kinds of changes:

#### A. Counterfactual memory update

Record:

- the hypothesis
- why it is plausible
- what observation would confirm it
- what observation would falsify it
- what subsystem or entity it touches

#### B. Experimental patch

Apply the smallest patch that meaningfully tests the hypothesis.

Keep the patch narrow. Do not mix unrelated cleanup.

### 6. Evaluate the patch

Run the best available checks:

- repro steps
- unit tests
- integration tests
- snapshots
- logs
- traces
- lint or type checks if relevant

Classify the result as one of:

- `failed`
- `partial`
- `success`

### 7. If the patch fails, revert but preserve learning

When a patch fails:

- revert the patch effects
- keep the branch history or a summarized note of what happened
- update `assets/blackboard.md`
- append to `assets/counterfactual-note.md`

The counterfactual note should preserve:

- failing tests
- error messages
- trace logs
- regression symptoms
- what this failure rules out
- constraints the next patch must respect

Do not merely say “patch failed”.
Say exactly how it failed and what that implies.

### 8. Repeat from the next best hypothesis

Loop:

1. choose next hypothesis
2. create hypothesis branch
3. record counterfactual setup
4. patch
5. test
6. revert if needed
7. preserve learning
8. update charts and notes

### 9. Merge only the winning patch

When a hypothesis succeeds:

- update `blackboard.md` with the winning explanation
- record why it worked
- merge the winning hypothesis branch into the bugfix branch
- rerun full relevant validation
- merge bugfix branch back to main only when clean

## Blackboard discipline

Keep `blackboard.md` compact and current.

It should answer, at a glance:

- What is broken?
- What are the leading hypotheses?
- What was already tried?
- What failed and why?
- What is the next move?
- Which branch contains the winning patch?

Recommended sections:

- Bug title
- Repro / failure condition
- Ishikawa chart
- Ranked hypotheses
- Current branch state
- Git graph
- Current next step

## Counterfactual-note discipline

Use `assets/counterfactual-note.md` as durable memory from reverted paths.

Each entry should include:

- hypothesis id
- patch id or branch
- expected effect
- actual effect
- failing tests
- relevant logs or stack trace
- lesson for next attempt
- explicit “avoid repeating” guidance if applicable

Prefer terse entries with operational value.

## Commit discipline

Use short prefixes:

- `bb:` blackboard update
- `cf:` counterfactual note
- `exp:` experimental patch
- `rev:` revert of failed patch
- `fix:` successful patch
- `merge:` winning merge

Example sequence:

- `bb: rank hypotheses for blurry photo bug`
- `cf: H2 suspect shutter speed path`
- `exp: tighten motion blur threshold`
- `rev: revert H2 threshold patch`
- `cf: H2 failed under low-light tests`
- `cf: H3 suspect beautification pipeline`
- `fix: disable unintended beautification filter`
- `merge: H3 into bugfix-B`

## Agent loop

Follow this loop exactly:

1. update blackboard
2. rank hypotheses
3. choose next hypothesis
4. create hypothesis branch
5. write counterfactual setup
6. patch minimally
7. test
8. on failure, revert and record
9. on success, merge winner
10. update blackboard again

## Output style for the agent

When reporting progress, always include:

- current hypothesis
- branch name
- patch status
- decisive evidence
- next move

Example:

- `Current hypothesis: H3 beautification filter applied unexpectedly`
- `Branch: bugfix-B-H3`
- `Status: success on repro and tests T1 T2 T3`
- `Evidence: blur disappears only when filter path is bypassed`
- `Next move: merge H3 into bugfix-B and rerun full regression suite`

## Minimal success criteria

A run of this skill is complete when:

- the issue has an explicit Ishikawa model
- each attempted hypothesis is reflected in gitGraph
- failed patches are reverted
- failed attempts leave behind useful counterfactual memory
- the winning patch is merged cleanly
- blackboard state reflects the final explanation and fix