---
title: Shared Fixture
description: Refactor repeated expensive setup by reusing one controlled fixture instance across tests.
keywords: [performance, shared-state, flaky, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor repeated expensive setup by reusing one controlled fixture instance across tests.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when the test problem is well described by: repeated expensive setup by reusing one controlled fixture instance across tests

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Fresh Fixture](./020-fresh-fixture.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Fresh Fixture](./020-fresh-fixture.md).
