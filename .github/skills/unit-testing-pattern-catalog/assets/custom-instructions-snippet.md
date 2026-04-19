# Custom instructions snippet

When writing or refactoring tests, select one concrete unit-testing pattern from this catalog.

## Selection rule:

- route by title, description, and keywords
- use the code smells in SKILL.md as the first routing layer
- pick the smallest pattern that fully explains the problem

## Execution rule:

- execute the pattern Action List first
- use the remaining sections only to confirm fit or reject alternatives
- keep tests shorter, simpler, and more local than the SUT
- avoid hidden setup, hidden teardown, implicit collaborators, and order dependence

## Feedback-loop rule:

- run tests yourself when tools allow it
- read console output, assertion failures, and exceptions directly
- do not ask the user to rerun tests if you can do it
- fix one issue at a time and rerun immediately

## Debugging rule:

- do not assume the bug is in the SUT
- consider whether the test, fixture, environment, or double is wrong
- when a change reveals a new issue, record it and continue deliberately

## Fine tuning instructions:

Once the testing framework has been determined add code examples in that framework to the pattern files.
