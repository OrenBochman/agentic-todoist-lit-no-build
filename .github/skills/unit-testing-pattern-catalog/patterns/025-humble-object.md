---
title: Humble Object
description: Refactor framework-heavy or UI-heavy code by extracting the logic into a plain testable object.
keywords: [ui, frontend, framework, decouple, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor framework-heavy or ui-heavy code by extracting the logic into a plain testable object.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when UI code, framework glue, or other hard-to-drive wrappers block direct unit testing of the real logic.

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Test Hook](./052-test-hook.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Test Hook](./052-test-hook.md).
