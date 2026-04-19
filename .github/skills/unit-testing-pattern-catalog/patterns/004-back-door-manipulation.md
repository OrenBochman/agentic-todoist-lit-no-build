---
title: Back Door Manipulation
description: Refactor slow or indirect setup by using a narrow internal seam for precise state control.
keywords: [fixture, database, internal-state, setup, integration]
---

## Action List
1. Confirm that front-door setup or verification would make the test too slow or too indirect.
2. Choose the narrowest back door that sets or reads only the state this test needs.
3. Use the back door only for setup or observation and not as the main behavior under test.
4. Name the helper so readers know they are bypassing normal flows on purpose.
5. Revisit the design if many tests need this pattern.

## When to use
Use when the test problem is well described by: slow or indirect setup by using a narrow internal seam for precise state control

## When not to use
Do not use when a simpler pattern would explain the issue more directly or when this refactoring would hide important local detail.

## Prefer over
[Fresh Fixture](./020-fresh-fixture.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Fresh Fixture](./020-fresh-fixture.md).
