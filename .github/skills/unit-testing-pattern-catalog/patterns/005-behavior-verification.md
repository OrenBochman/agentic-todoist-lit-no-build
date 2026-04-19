---
title: Behavior Verification
description: Refactor indirect-output tests to verify collaborator interactions explicitly.
keywords: [interaction, collaborator, mock, spy, contract, api]
---

## Action List
1. Identify the collaborator interactions that define success for this scenario.
2. Replace the real collaborator with a double that can record or verify those interactions.
3. Exercise the system through its normal public entry point.
4. Check the observed calls against the expected behavior and nothing broader.
5. Remove interaction assertions that merely duplicate state assertions.

## When to use
Use when the important outcome is that the system sends the right messages or commands to collaborators.

## When not to use
Do not use when the rule is easier to express by inspecting the resulting state.

## Prefer over
[State Verification](./043-state-verification.md)

## Problem and smells
Indirect outputs are untested and orchestration bugs stay hidden.

## Expected improvement
Sharper tests for notifications, command dispatch, and orchestration behavior.

## Notes
See also [State Verification](./043-state-verification.md).
