---
title: Testcase Object
description: Refactor tests into first-class runnable objects when the framework or orchestration model requires it.
keywords: [command, object-framework, runner, organization]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor tests into first-class runnable objects when the framework or orchestration model requires it.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when the test problem is well described by: tests into first-class runnable objects when the framework or orchestration model requires it

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Test Method](./053-test-method.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Test Method](./053-test-method.md).
