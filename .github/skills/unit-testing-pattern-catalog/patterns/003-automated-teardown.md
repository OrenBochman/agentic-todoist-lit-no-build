---
title: Automated Teardown
description: Refactor manual cleanup into one automatic teardown path for created resources.
keywords: [teardown, cleanup, resource-leak, unit]
---

## Action List
1. List the resources the test creates that can leak beyond the test run.
2. Register each created resource with one cleanup mechanism as soon as it is created.
3. Run that cleanup automatically after the test even when the test fails halfway through.
4. Keep cleanup idempotent so repeated teardown attempts do not create new failures.
5. Remove scattered inline cleanup code once the automatic path is reliable.

## When to use
Use when the test problem is well described by: manual cleanup into one automatic teardown path for created resources

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Garbage-Collected Teardown](./021-garbage-collected-teardown.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Garbage-Collected Teardown](./021-garbage-collected-teardown.md).
