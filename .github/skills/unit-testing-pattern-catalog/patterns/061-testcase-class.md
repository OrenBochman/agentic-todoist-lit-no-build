---
title: Testcase Class
description: Refactor scattered related tests into one coherent class with a clear scope.
keywords: [organization, grouping, class, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor scattered related tests into one coherent class with a clear scope.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when the test problem is well described by: scattered related tests into one coherent class with a clear scope

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Testcase Class per Feature](./063-testcase-class-per-feature.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Testcase Class per Feature](./063-testcase-class-per-feature.md).
