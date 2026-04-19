---
title: Configurable Test Double
description: Refactor repeated ad hoc doubles into one reusable double with explicit configuration.
keywords: [double, configurable, reuse, api, unit]
---

## Action List
1. List the collaborator behaviors that vary across tests.
2. Create one reusable double with explicit configuration points for those behaviors.
3. Configure the double in each test setup rather than branching inside the test body.
4. Keep the configuration API small so the double does not become a second framework.
5. Split or simplify the double if configuration starts hiding intent.

## When to use
Use when the test problem is well described by: repeated ad hoc doubles into one reusable double with explicit configuration

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Hard-Coded Test Double](./024-hard-coded-test-double.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Hard-Coded Test Double](./024-hard-coded-test-double.md).
