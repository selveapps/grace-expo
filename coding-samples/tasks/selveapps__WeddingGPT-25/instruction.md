A task lists the tasks it waits for in waitsFor.

Completing a waiting task is allowed, and the screen shows what it still waits for.
Refuse a self-link, a duplicate link, a link to a missing task, an eleventh prerequisite, and any link that would close a cycle.
A deleted or skipped prerequisite stops blocking. A finished task is never waiting.
The daily checklist skips tasks that are still waiting, and plans a waiting task for the day after its prerequisite is done.
Plan generation fills waitsFor from the template titles, and only when both tasks are in that plan. A short plan must not leave a task waiting for a title that was dropped.
If sync has already created a cycle, readers finish instead of looping.
The original pull request body is an empty template. This statement is the behavior the tests grade.

The hidden tests import:
- `React` from `react`
- `usePlanningStore` from `@/store`
- `TaskStatus` from `@/models`
- `act, press, pressables, renderWithProviders, shownTexts` from `@/test/render`
- `TaskDependencies` from `../TaskDependencies`
- `TaskRow` from `../TaskRow`
