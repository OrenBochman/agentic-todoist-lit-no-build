---
title: Data-Driven Test
description: Refactor many similar cases into one test algorithm driven by external case data.
keywords: [cases, data-file, regression, table, unit]
---

## Action List
1. Separate the stable test algorithm from the changing example data.
2. Store the case data in a simple external format the test can load deterministically.
3. Write one interpreter that reads each case and runs the same setup, exercise, and verification flow.
4. Keep each case row explicit enough that failures can be traced to one scenario quickly.
5. Move back to local parameterization if the external file adds more indirection than value.

## When to use
Use when one testing rule must run over many cases and embedding all of them inline would be unwieldy.

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Parameterized Test](./036-parameterized-test.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Parameterized Test](./036-parameterized-test.md).
