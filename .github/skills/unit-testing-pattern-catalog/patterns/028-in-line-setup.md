---
title: In-line Setup
description: Refactor over-extracted or hidden fixture setup back into the test body.
keywords: [local-clarity, fixture, frontend, backend, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor over-extracted or hidden fixture setup back into the test body.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when fixture setup is short enough that local explicitness is clearer than shared helpers or hooks.

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Delegated Setup](./012-delegated-setup.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Delegated Setup](./012-delegated-setup.md).
