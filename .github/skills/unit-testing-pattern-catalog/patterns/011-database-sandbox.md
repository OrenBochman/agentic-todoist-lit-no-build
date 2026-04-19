---
title: Database Sandbox
description: Refactor shared database testing into isolated per-run or per-developer database space.
keywords: [database, sandbox, persistence, isolation, integration]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor shared database testing into isolated per-run or per-developer database space.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when tests need a real database and shared state is causing collisions or unreliable runs.

## When not to use
Do not use when the database is not part of the behavior under test and a fake or stub would be enough.

## Prefer over
[Stored Procedure Test](./044-stored-procedure-test.md)

## Problem and smells
Shared data collisions, flaky persistence tests, and test run wars.

## Expected improvement
Independent database tests and fewer environment surprises.

## Notes
Often pairs with [Transaction Rollback Teardown](./067-transaction-rollback-teardown.md) or [Table Truncation Teardown](./046-table-truncation-teardown.md).
