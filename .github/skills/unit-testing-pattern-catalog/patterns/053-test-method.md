---
title: Test Method
description: Refactor overstuffed test logic so one executable method owns one behavior or rule.
keywords: [one-behavior, naming, readability, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor overstuffed test logic so one executable method owns one behavior or rule.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when the test problem is well described by: overstuffed test logic so one executable method owns one behavior or rule

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Four-Phase Test](./019-four-phase-test.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Four-Phase Test](./019-four-phase-test.md).
