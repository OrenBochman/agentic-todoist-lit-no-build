---
title: State Verification
description: Refactor interaction-heavy or over-mocked tests into checks against resulting state.
keywords: [result, output, backend, frontend, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor interaction-heavy or over-mocked tests into checks against resulting state.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when the contract is best expressed by returned values, stored data, rendered state, or object state.

## When not to use
Do not use when the essential rule is an interaction contract with another component.

## Prefer over
[Behavior Verification](./005-behavior-verification.md)

## Problem and smells
Overuse of interaction testing and noisy collaborator checks.

## Expected improvement
Simple robust tests with stable assertions.

## Notes
See also [Behavior Verification](./005-behavior-verification.md).
