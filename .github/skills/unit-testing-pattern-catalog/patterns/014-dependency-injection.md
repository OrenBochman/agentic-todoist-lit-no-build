---
title: Dependency Injection
description: Refactor hidden collaborators into explicit injected dependencies.
keywords: [dependency, seam, mock, stub, api, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor hidden collaborators into explicit injected dependencies.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when hidden dependencies or global lookups make the code hard to test or reason about.

## When not to use
Do not use when the code already has a clear explicit collaborator seam and injection adds no new control.

## Prefer over
[Dependency Lookup](./015-dependency-lookup.md)

## Problem and smells
Hidden dependencies, global coupling, brittle setup, hard-to-test code.

## Expected improvement
Explicit seams, easier doubles, and smaller test context.

## Notes
This is usually the preferred direction for network calls, external APIs, clocks, and random sources.
