import {
  expect,
  getFixture,
  mountEmptyFixture,
  clearFixture,
  addTaskWithHostInput,
  addTaskWithNativeInput,
  getBoardItem,
  setProjectFilter,
} from './task-manager-test-helpers.js';

describe('Task Manager Add Flow Regression', () => {
  beforeEach(async () => {
    await mountEmptyFixture();
  });

  afterEach(() => {
    clearFixture();
  });

  it('add flow: clicking add increases task count', async () => {
    const fixture = getFixture();
    const beforeCount = fixture.app.tasks.length;

    await addTaskWithHostInput('test 123');

    expect(
      fixture.app.tasks.length,
      'Task count should increase by 1 after add click.',
    ).to.equal(beforeCount + 1);
  });

  it('add flow: new task appears at top of app state and board', async () => {
    const fixture = getFixture();

    await addTaskWithHostInput('test 123');

    expect(
      fixture.app.tasks[0]?.text,
      'First task in app state should match entered text.',
    ).to.equal('test 123');
    expect(
      getBoardItem()?.task?.text ?? '',
      'First rendered task in board should match entered text.',
    ).to.equal('test 123');
  });

  it('add flow: composer input resets after add', async () => {
    const fixture = getFixture();

    await addTaskWithHostInput('test 123');

    expect(
      fixture.input.value,
      'Composer input should be cleared after adding a task.',
    ).to.equal('');
  });

  it('native input add: clicking add increases task count', async () => {
    const fixture = getFixture();
    const beforeCount = fixture.app.tasks.length;

    await addTaskWithNativeInput('native add task');

    expect(
      fixture.app.tasks.length,
      'Task count should increase by 1 after native input add.',
    ).to.equal(beforeCount + 1);
  });

  it('native input add: new task appears at top of app state and board', async () => {
    const fixture = getFixture();

    await addTaskWithNativeInput('native add task');

    expect(
      fixture.app.tasks[0]?.text,
      'First task in app state should match native input value.',
    ).to.equal('native add task');
    expect(
      getBoardItem()?.task?.text,
      'First rendered task in board should match native input value.',
    ).to.equal('native add task');
  });

  it('native input add: board renders the live native input value', async () => {
    await addTaskWithNativeInput('native add task');

    expect(
      getBoardItem()?.task?.text,
      'Board should render the live native input value after add.',
    ).to.equal('native add task');
  });

  it('inherits the active named project filter when adding a task without a project', async () => {
    const fixture = getFixture();
    await setProjectFilter(fixture.app, 'Work');

    await addTaskWithHostInput('follow up');

    expect(fixture.app.tasks[0]?.project).to.equal('Work');
    expect(getBoardItem()?.task?.project).to.equal('Work');
  });

  it('keeps tasks unassigned when adding under the default project filter', async () => {
    const fixture = getFixture();
    await setProjectFilter(fixture.app, 'default-project');

    await addTaskWithHostInput('inbox item');

    expect(fixture.app.tasks[0]?.project).to.equal(null);
  });

  it('preserves an explicit project in the input over the active project filter', async () => {
    const fixture = getFixture();
    await setProjectFilter(fixture.app, 'Work');

    await addTaskWithHostInput('review notes #Personal');

    expect(fixture.app.tasks[0]?.project).to.equal('Personal');
  });
});
