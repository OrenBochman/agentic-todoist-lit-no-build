---
title: Assertion Message
description: Refactor ambiguous assertions via explicit diagnostic messages.
keywords: [assertion, diagnostics, failure-output, triage, unit]
---

## Action List
1. Find assertions whose failure output does not make the violated rule obvious.
2. Write one brief message that states the expected behavior in domain language.
3. Attach the message directly to the assertion rather than adding a comment above it.
4. Keep the message stable and specific so it helps during failure triage.
5. Delete or rewrite messages that merely restate the code.

## When to use
Use when an assertion may fail ambiguously and a reader would otherwise need surrounding code to understand the failure.

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Assertion Method](./002-assertion-method.md)

## Problem and smells
Ambiguous failure output, assertion roulette, slow debugging.

## Expected improvement
Clearer failures and faster diagnosis.

## Notes
See also [Assertion Method](./002-assertion-method.md).
