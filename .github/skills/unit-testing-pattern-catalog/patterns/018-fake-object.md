---
title: Fake Object
description: Refactor infrastructure-heavy dependencies into a lightweight working implementation.
keywords: [stateful-double, in-memory, persistence, flaky, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor infrastructure-heavy dependencies into a lightweight working implementation.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when tests need meaningful collaborator behavior but the real version is slow, costly, or hard to run in tests.

## When not to use
Do not use when the only need is to verify calls or provide one fixed response.

## Prefer over
[Mock Object](./034-mock-object.md)

## Problem and smells
Slow infrastructure, overuse of mocks, brittle interaction tests, or flakiness from real dependencies.

## Expected improvement
Fast realistic tests with fewer brittle interaction assertions.

## Notes
Useful for reducing flakiness around network and persistence when the contract is stateful rather than interaction-heavy.
