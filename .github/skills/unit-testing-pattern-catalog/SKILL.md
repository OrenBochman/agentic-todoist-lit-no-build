---
name: unit-testing-pattern-catalog
description: Refactoring patterns and best practices for improving Test code.
metadata: 
  version: "1.10"
---

This skill has
1. instruction on testing best practices, 
2. some testing code smells,
3. a workflow for tightening feedback loops between code, execution, diagnosis, and fix,
4. some baseline on diagnosis
5. A workflow for using memory and git reverts to roll back recent changes when multiple tests fail, and 
6. A pattern catalog with links to patterns for refactorings organized by domain and smell.

Use this skill to introduce and improve test as 
## Mission Statement

Your mission is to **squish bugs and accelerate feature development by reducing regressions**.

- Engage bugs directly and do not let them escape behind workarounds.
- Fix one issue at a time, but record new issues discovered during the fix.
- When a fix creates a new failure, decide whether the fix caused it or merely revealed it.
- Do not assume the bug is in the SUT. The problem may be in the test code itself.
- Test are an executable specification of the system encoding edge cases, invariants, happy paths, failure modes, and contracts between internal units and external collaborators.
- Test first is a proven strategy for incremental development with reduced risks. 
- Test facilitate refactoring the app code by introducing invariants to check changes in correctness before and after the refactor.

## Backbone rules for testing

- Evolve tests to be simpler and shorter than the SUT (System Under Test).
- Prefer one behavior and one failure mode per test.
- Better to fail fast with a clear 
- Prefer explicit dependencies over hidden lookup.
- Prefer state verification when interactions are not the real contract.
- Prefer the smallest pattern that fully explains the test.
- Treat chained tests, hidden setup, accidental shared state, and noisy failure output as smells.



## UI Testing Workflow: Manual Verification Before Automation

Before adding or updating automated UI tests:

- Open the app and manually test the scenario in the real UI.
- Use browser automation (VS Code browser, Playwright MCP, etc.) to replicate the user flow and observe actual behavior.
- Only proceed to write or update automated UI tests after confirming the real app behavior matches the intended outcome.
- If a test fails but the manual UI works, review the test for unrealistic assumptions or fixture issues before assuming a code bug.
- Add diagnostic logging to tests when discrepancies are found to aid debugging.

This ensures automated tests reflect real user experience and reduces false positives/negatives.

### Steps

1. Open the app in a browser.
2. Manually perform the scenario to verify expected behavior.
3. Use browser automation or Playwright MCP to script the scenario and observe state changes.
4. Update or write the automated test to match the real UI flow.
5. If the test fails but the UI is correct, debug the test setup and add diagnostics.
6. Only treat as a code bug if both manual and automated tests fail.

## Tighten feedback loops

1. When testing, agents must minimize latency between **code, execution, error, diagnosis, and fix**.
2. Close the loop, ensure the project meets the Environment expectations for logging and error visibility.
3. Strive to run tests, access the logs, and refactor with minimal human intervention. Do not ask the user to run tests if you can do it yourself.

### Role of Human in the loop

1. The human copilot's role is to take a more strategic view of the testing process, and step in  with insights, questions, and decisions that stir the team forward to faster resolution. 
1. Requesting human input places a cognitive burden on the user which reduces the efficiency of the feedback loop and the team.
The human should not be a bottleneck in the feedback loop, but rather a catalyst for faster and more effective testing and debugging.
1. Thus you should strive to be proactive and minimize human in the loop friction while keeping the human informed and engaged in the process.

### Feedback loop

1. Run the relevant tests.
2. Read assertion failures, exceptions, and console output.
3. Decide whether the failure is in the test, the fixture, the environment, or the SUT.
4. Make one local change.
5. Re-run immediately.

## Diagnostic Hierarchy

Testing new bugs requires diagnosing the source of failure. The common sense approach is to begin with the most likely causes, eliminate them and then move down the hierarchy to less likely causes.

There shouldn't be multiple test failure at the same time. When this happens it suggest that recent edits have had a catastrophic effect on the project rather then the intended effect.

1. Test first code written without implementation. Once we see that it fails (alone) fix it by writing the implementation.
2. Single Failure that isn't test in new testing code is likely to be due to bad test code or misperception of the testing fixture.
3. Multiple failures involving suggest unintended changes to the codebase. The failure mode should be documented to local memory and rolled back to the last known good state using git revert. Then the required change should be reintroduced  in a more controlled way with the attention to possible failures from the memory of the previous attempts.
4. Old tests, particularly regression tests often start failing due to a reversion (e.g. copy paste of bugs back into the codebase - recent changes can reveal this problem.) more challenging is that the regression is a new edge case that that was never handled correctly in the first place.
5.  Next are flakey tests that have some sort of non-determinism AKA flakiness. Like network calls, timeouts, or shared state. Fixes for these are documented in the pattern catalog below.
6. Next are are environmental issues like fixtures like databases that need to be reset. These should be fixed by improving the fixture setup and teardown to ensure a clean state for each test. These are covered in the pattern catalog below.
5. Next are breaking changes in an API of a library.
  - If the breaking change predates  the cutoff date, the agent should be able to recover the correct API form by attending to the failure message and self-steering to the correct call form.
  - If the breaking change is more recent than the cutoff date a resource like `Context7 MCP tool` or the api docs will indicate the correct form. 
  - Either way these breaking changes should be documented in the project\user level memory using `api-breaking-changes.md` for use in future chat sessions.
6. Unlikely source of failure are: in the framework, library or CDN. While possible, it is a waste of resources to investigate such hypothesis till all other sources of failure have been eliminated.

### Environment expectations

- Use the browser automation tool when the project runs in the browser.
- Capture console errors, assertion messages, stack traces, and network failures.
- Do not ask the human to rerun tests if you can do it yourself.
- Configure logging so failures are visible in the console without extra human steps.
- For UI work, make the SUT visibly inspectable in the fixture when that speeds diagnosis.

## Baseline interaction with the user

- Minimize interruptions.
- Report the current failing issue clearly and briefly.
- Tell the user when a new issue was revealed rather than caused.
- Ask for help only when blocked on missing access, missing intent, or an ambiguous product decision.
- Treat the user's time as the most limited resource in the loop.

## Project-level testing guidance

- Start with edge cases and failure modes, not only the happy path.
- After the edge cases are covered, broaden coverage to the happy path.
- Keep a meaningful fraction of tests outside the happy path.
- Split fixture code from test code when that improves readability. c.f. [Four-Phase Test](patterns/019-four-phase-test.md).
- Keep tests open for further extension as coverage grows. c.f [Minimal Fixture](patterns/033-minimal-fixture.md).
- When building from a spec, whether a whole app or a feature, use planning to create an ordered TDD plan that introduces one behavior at a time.
- Give each test a short descriptive name that states the context, the expected behavior, and the unit under test.
- Add a short fixture comment when the setup intent would otherwise be unclear.
- Add a short assertion comment only when the checked behavior is not obvious from the assertion itself. c.f. [Assertion Message](patterns/001-assertion-message.md).

## Tooling baseline

Default browser-oriented baseline:
- Mocha for test running and structure such as `describe` and `it`
- Chai for assertions such as `expect` and `assert`
- Chai Spies for test doubles such as `spy` and `stub`
- CDN delivery such as `https://unpkg.com`

Adapt that baseline only when the project clearly needs a different stack.

## Usage Strategy

1. Route by the pattern title, description, and keywords.
2. Execute the pattern's Action List.
3. Read the rest of the file only to confirm fit, reject nearby alternatives, or understand the smell and payoff.
4. Make one small local change.
5. Re-run the relevant tests and continue the loop.


## Domain routing cues
Use the keywords in the pattern files to improve routing:

- `ui`, `frontend`, `browser`, `component`, `dom` for visual and interaction-heavy tests.
- `backend`, `service`, `logic`, `pure` for local computation and service-layer behavior.
- `database`, `persistence`, `sql`, `integration` for real storage concerns.
- `api`, `network`, `contract`, `external` for collaborator and boundary behavior.
- `flaky`, `shared-state`, `cleanup`, `performance` for stability and speed issues.
- `assertion`, `fixture`, `mock`, `stub`, `spy`, `fake` for technique-level routing.


## Resources

### Code Smells

Use these smells as the first routing layer before choosing a pattern.

- **Ambiguous failure output** — `assertion, diagnostics`. Use [Assertion Message](patterns/001-assertion-message.md) or [Custom Assertion](patterns/009-custom-assertion.md).
- **Duplicated verification** — `duplication, assertion`. Use [Assertion Method](patterns/002-assertion-method.md) or [Custom Assertion](patterns/009-custom-assertion.md).
- **Large or noisy fixture** — `fixture, bloat`. Use [Minimal Fixture](patterns/033-minimal-fixture.md), [Fresh Fixture](patterns/020-fresh-fixture.md), or [In-line Setup](patterns/028-in-line-setup.md).
- **Hidden dependency** — `dependency, seam`. Use [Dependency Injection](patterns/014-dependency-injection.md) or [Humble Object](patterns/025-humble-object.md).
- **Flaky shared state** — `flaky, shared-state`. Use [Fresh Fixture](patterns/020-fresh-fixture.md) and eliminate [Chained Tests](patterns/006-chained-tests.md).
- **Wrong double type** — `mock, stub, spy, fake`. Start at [Test Double](patterns/049-test-double.md).
- **Slow database tests** — `database, cleanup`. Use [Database Sandbox](patterns/011-database-sandbox.md), [Transaction Rollback Teardown](patterns/067-transaction-rollback-teardown.md), or [Table Truncation Teardown](patterns/046-table-truncation-teardown.md).
- **UI or framework code is hard to unit test** — `ui, framework`. Use [Humble Object](patterns/025-humble-object.md), [Test Hook](patterns/052-test-hook.md), or [Layer Test](patterns/030-layer-test.md).
- **Conditional test logic** — `branching, readability`. Use [Guard Assertion](patterns/023-guard-assertion.md).
- **Many similar cases** — `cases, parameterization`. Use [Parameterized Test](patterns/036-parameterized-test.md) or [Data-Driven Test](patterns/010-data-driven-test.md).

## Pattern Catalog

Load only one pattern at a time unless composition is clearly required.

### Code Smells and Failure Diagnostics
- [Assertion Message](patterns/001-assertion-message.md)
- [Assertion Method](patterns/002-assertion-method.md)
- [Custom Assertion](patterns/009-custom-assertion.md)
- [Guard Assertion](patterns/023-guard-assertion.md)
- [Unfinished Test Assertion](patterns/068-unfinished-test-assertion.md)
- [Chained Tests](patterns/006-chained-tests.md)
- [Minimal Fixture](patterns/033-minimal-fixture.md)

### Fixture Setup and Teardown
- [Fresh Fixture](patterns/020-fresh-fixture.md)
- [Shared Fixture](patterns/041-shared-fixture.md)
- [Standard Fixture](patterns/042-standard-fixture.md)
- [Minimal Fixture](patterns/033-minimal-fixture.md)
- [In-line Setup](patterns/028-in-line-setup.md)
- [Delegated Setup](patterns/012-delegated-setup.md)
- [Implicit Setup](patterns/026-implicit-setup.md)
- [Lazy Setup](patterns/031-lazy-setup.md)
- [Prebuilt Fixture](patterns/037-prebuilt-fixture.md)
- [In-line Teardown](patterns/029-in-line-teardown.md)
- [Implicit Teardown](patterns/027-implicit-teardown.md)
- [Automated Teardown](patterns/003-automated-teardown.md)
- [Garbage-Collected Teardown](patterns/021-garbage-collected-teardown.md)
- [Suite Fixture Setup](patterns/045-suite-fixture-setup.md)
- [Setup Decorator](patterns/040-setup-decorator.md)

### Result Verification
- [State Verification](patterns/043-state-verification.md)
- [Behavior Verification](patterns/005-behavior-verification.md)
- [Delta Assertion](patterns/013-delta-assertion.md)

## Test Doubles and Collaborators
- [Test Double](patterns/049-test-double.md)
- [Dummy Object](patterns/017-dummy-object.md)
- [Test Stub](patterns/057-test-stub.md)
- [Test Spy](patterns/056-test-spy.md)
- [Mock Object](patterns/034-mock-object.md)
- [Fake Object](patterns/018-fake-object.md)
- [Configurable Test Double](patterns/007-configurable-test-double.md)
- [Hard-Coded Test Double](patterns/024-hard-coded-test-double.md)
- [Dependency Injection](patterns/014-dependency-injection.md)
- [Dependency Lookup](patterns/015-dependency-lookup.md)
- [Test Hook](patterns/052-test-hook.md)
- [Test-Specific Subclass](patterns/060-test-specific-subclass.md)

### Organization and Scaling
- [Four-Phase Test](patterns/019-four-phase-test.md)
- [Test Method](patterns/053-test-method.md)
- [Test Helper](patterns/051-test-helper.md)
- [Test Utility Method](patterns/059-test-utility-method.md)
- [Named Test Suite](patterns/035-named-test-suite.md)
- [Test Selection](patterns/055-test-selection.md)
- [Test Discovery](patterns/048-test-discovery.md)
- [Test Enumeration](patterns/050-test-enumeration.md)
- [Test Runner](patterns/054-test-runner.md)
- [Test Automation Framework](patterns/047-test-automation-framework.md)
- [Test Suite Object](patterns/058-test-suite-object.md)
- [Testcase Class](patterns/061-testcase-class.md)
- [Testcase Class per Class](patterns/062-testcase-class-per-class.md)
- [Testcase Class per Feature](patterns/063-testcase-class-per-feature.md)
- [Testcase Class per Fixture](patterns/064-testcase-class-per-fixture.md)
- [Testcase Superclass](patterns/066-testcase-superclass.md)
- [Testcase Object](patterns/065-testcase-object.md)

### Data, Database, and Architecture
- [Data-Driven Test](patterns/010-data-driven-test.md)
- [Parameterized Test](patterns/036-parameterized-test.md)
- [Database Sandbox](patterns/011-database-sandbox.md)
- [Stored Procedure Test](patterns/044-stored-procedure-test.md)
- [Transaction Rollback Teardown](patterns/067-transaction-rollback-teardown.md)
- [Table Truncation Teardown](patterns/046-table-truncation-teardown.md)
- [Layer Test](patterns/030-layer-test.md)
- [Humble Object](patterns/025-humble-object.md)
- [Back Door Manipulation](patterns/004-back-door-manipulation.md)

### Value Construction
- [Literal Value](patterns/032-literal-value.md)
- [Derived Value](patterns/016-derived-value.md)
- [Generated Value](patterns/022-generated-value.md)
- [Creation Method](patterns/008-creation-method.md)
