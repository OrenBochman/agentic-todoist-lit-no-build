---
title: Custom Assertion
description: Refactor noisy object comparison into one domain-specific assertion.
keywords: [assertion, equality, domain, diagnostics, unit]
---

## Action List
1. Identify the exact attributes or rules that define success for this test.
2. Write one named assertion that checks those attributes and ignores irrelevant differences.
3. Use the custom assertion directly instead of a long block of primitive assertions.
4. Make failure output name the missing or mismatched domain property.
5. Split the assertion if it becomes too broad.

## When to use
Use when the test problem is well described by: noisy object comparison into one domain-specific assertion

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Assertion Method](./002-assertion-method.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Assertion Method](./002-assertion-method.md).
