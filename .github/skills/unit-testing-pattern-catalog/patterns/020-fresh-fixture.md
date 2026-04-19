---
title: Fresh Fixture
description: Refactor shared mutable setup into a new fixture for each test.
keywords: [isolation, flaky, shared-state, regression, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor shared mutable setup into a new fixture for each test.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when tests influence one another through shared objects, rows, files, or mutable fixture state.

## When not to use
Do not use when setup cost is extreme and safe sharing is demonstrably cheaper than fresh construction.

## Prefer over
[Shared Fixture](./041-shared-fixture.md)

## Problem and smells
Interacting tests, erratic failures, order dependence, hidden state leakage.

## Expected improvement
Independent tests, safer parallelization, and easier debugging.

## Notes
This is a default bias for unit tests. Pair with [Minimal Fixture](./033-minimal-fixture.md).
