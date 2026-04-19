---
title: Assertion Method
description: Refactor duplicated assertion logic via extraction into a named helper.
keywords: [assertion, helper, duplication, extraction, unit]
---

## Action List
1. Identify repeated assertion code that checks the same rule in multiple tests.
2. Extract that verification into a named helper whose name states the rule in domain language.
3. Pass only the values needed to evaluate the rule and keep setup logic out of the helper.
4. Replace repeated assertion blocks with calls to the helper.
5. Inline the helper again if the extraction makes the tests harder to scan.

## When to use
Use when several tests repeat the same verification shape and the repeated assertions hide the rule being checked.

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Custom Assertion](./009-custom-assertion.md)

## Problem and smells
Test code duplication, noisy verification blocks, low readability.

## Expected improvement
Shorter tests and one place to update shared verification logic.

## Notes
Use [Custom Assertion](./009-custom-assertion.md) when the assertion itself needs a domain concept.
