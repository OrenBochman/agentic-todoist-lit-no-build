---
title: Creation Method
description: Refactor noisy object construction into a named fixture-building helper.
keywords: [fixture, helper, setup, builder, readability]
---

## Action List
1. Find construction code that is repeated or distracts from the test's point.
2. Extract a helper whose name states the kind of ready-to-use object it creates.
3. Hide incidental construction detail inside the helper and keep essential values visible at the call site.
4. Use the helper from tests that need the same object shape.
5. Inline the helper again if readers must jump away to understand the scenario.

## When to use
Use when the test problem is well described by: noisy object construction into a named fixture-building helper

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
