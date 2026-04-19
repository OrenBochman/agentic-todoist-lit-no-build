---
title: Mock Object
description: Refactor collaborator checks into a test-specific object that verifies required calls.
keywords: [mock, interaction, contract, external-api, network, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor collaborator checks into a test-specific object that verifies required calls.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when correct interaction with another component is the main contract under test.

## When not to use
Do not use when a fake, stub, or spy would express the scenario more simply.

## Prefer over
[Test Spy](./056-test-spy.md)

## Problem and smells
Unverified collaborator contracts, missed calls, orchestration bugs, or external API contract drift.

## Expected improvement
Precise interaction checks and stronger behavioral contracts.

## Notes
Good for external API contracts and network failure scenarios, but easy to overuse.
