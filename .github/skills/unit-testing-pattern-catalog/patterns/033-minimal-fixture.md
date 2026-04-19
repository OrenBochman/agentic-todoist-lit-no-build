---
title: Minimal Fixture
description: Refactor oversized fixtures by keeping only the state and collaborators the test actually uses.
keywords: [fixture, smell, bloat, readability, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor oversized fixtures by keeping only the state and collaborators the test actually uses.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when large generic fixtures make tests noisy, fragile, or harder to understand than necessary.

## When not to use
Do not use when many tests truly need the same broader fixture and shrinking it would only add duplication without clarity.

## Prefer over
[Standard Fixture](./042-standard-fixture.md)

## Problem and smells
General fixture smell, obscure tests, brittle unused setup, inflated context windows.

## Expected improvement
Smaller clearer tests, less accidental coupling, and easier agent edits.

## Notes
This is one of the highest-value defaults for keeping tests and fixtures lean.
