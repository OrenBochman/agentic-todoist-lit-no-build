---
title: Test Stub
description: Refactor uncontrolled collaborator input into a fixed controllable stand-in.
keywords: [stub, indirect-input, api, network, data, unit]
---

## Action List
1. Identify the current test or fixture problem that matches this pattern.
2. Apply a small refactoring to refactor uncontrolled collaborator input into a fixed controllable stand-in.
3. Keep the change local and preserve the main behavior under test.
4. Rerun the relevant tests and check whether failure output and readability improved.
5. Undo or simplify the change if it increases indirection without adding signal.

## When to use
Use when the collaborator's job in the test is to feed data into the system under test.

## When not to use
Do not use when the collaborator is irrelevant or when the real need is to verify outgoing calls.

## Prefer over
[Dummy Object](./017-dummy-object.md)

## Problem and smells
Uncontrolled indirect inputs and hard-to-reproduce collaborator behavior.

## Expected improvement
Deterministic collaborator inputs and simpler isolated tests.

## Notes
Very useful for external API responses, network failures, and time-dependent data when you want stable tests.
