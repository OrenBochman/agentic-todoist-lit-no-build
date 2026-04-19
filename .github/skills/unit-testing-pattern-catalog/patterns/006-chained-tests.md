---
title: Chained Tests
description: Refactor order-dependent tests into independent tests with explicit setup.
keywords: [order-dependent, flaky, smell, fixture, regression]
---

## Action List
1. Find tests that pass only because another test ran first or left state behind.
2. Move the required setup from the earlier test into explicit setup for the later test.
3. Give each test its own fresh starting state and remove cross-test assumptions.
4. Run the affected tests in isolation and in random order to confirm independence.
5. Delete helper code that exists only to preserve the chain.

## When to use
Use when you discover that tests depend on execution order or on state left behind by other tests.

## When not to use
Do not use as a design choice for new tests.

## Prefer over
[Fresh Fixture](./020-fresh-fixture.md)

## Problem and smells
This pattern addresses a recurring test smell in readability, isolation, diagnosis, setup, teardown, collaborator control, or organization.

## Expected improvement
Applied well, this refactoring should make the test easier to scan, easier to diagnose, and cheaper to maintain.

## Notes
See also [Fresh Fixture](./020-fresh-fixture.md).
