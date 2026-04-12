---
title: Web Awesome Notes
description: Notes on integrating Web Awesome with a Lit app, including lessons learned, correct and incorrect patterns, and debugging workflow.
---


## Context

This repository is a no-build `Lit` app that runs directly in the browser from static files. That constraint matters for `Web Awesome` integration because some package entry points assume a bundler or a module resolver that the browser does not provide by default.

The working setup in this repo is:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.5.0/dist/styles/webawesome.css"
/>

<script type="module">
  import {
    setBasePath,
    startLoader,
  } from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

  setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
  startLoader();
  import './script.js';
</script>
```

And the app host preloads the components that will be used inside Lit shadow roots:

```html
<task-manager-app data-wa-preload="wa-button wa-input"></task-manager-app>
```

`data-wa-preload` is declarative metadata for the Web Awesome loader. In this repo, the attribute value is not read by `task-manager-app` itself. The loader scans the light DOM for `data-wa-preload`, parses the space-separated tag names, and loads those Web Awesome components before Lit renders them inside shadow DOM.

## Lessons Learned On Lit Interop

### 1. `customElements.whenDefined()` does not define anything

It only waits for a definition that must happen elsewhere.

The important part is that registration happens in the app bootstrap layer, not inside the Lit component that merely renders `<wa-button>`.

**Correct: app bootstrap defines the loading strategy, component only waits if it really must**:

```js
// index.html or app bootstrap module
import {
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
startLoader();

// If wa-button will only appear inside Lit shadow DOM, preload it from light DOM.
document.querySelector('task-manager-app')?.setAttribute(
  'data-wa-preload',
  'wa-button wa-input',
);
```

```js
// inside a Lit component, only if you need to call methods on the element
await customElements.whenDefined('wa-button');

const button = this.renderRoot.querySelector('wa-button');
button?.focus();
```

**Correct: app bootstrap explicitly asks the loader to discover a subtree**:

```js
// app bootstrap module, before or alongside app startup
import {
  discover,
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
startLoader();

const host = document.querySelector('task-manager-app');
host?.setAttribute('data-wa-preload', 'wa-button wa-input');
await discover(host);
```

In other words:

- app bootstrap is responsible for making `wa-button` loadable and definable
- the Lit component is responsible for rendering `<wa-button>` and using it once defined

**Incorrect**:

```js
// Lit component code
// This waits forever if app bootstrap never loaded or preloaded wa-button.
await customElements.whenDefined('wa-button');
```

**Incorrect**:

```js
// Lit component code
// Rendering the tag does not define it.
render() {
  return html`<wa-button>+</wa-button>`;
}
```

In this project, the original problem was not timing. The problem was that `wa-button` was never being registered in the first place.

### 2. Raw package ESM from a CDN is not automatically browser-safe

Using raw package modules from `jsdelivr` exposed unresolved bare imports such as `lit/decorators.js` and `@shoelace-style/localize`.

Incorrect for this repo's no-build browser setup:

```js
import 'https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.5.0/dist/components/button/button.js';
```

This can work in a bundled app, but in this static app the browser saw raw package ESM with internal bare specifiers.

Correct for this repo at app bootstrap time:

```js
// index.html or app bootstrap module
import {
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
startLoader();
```

`esm.sh` rewrites bare imports so the browser can load the module graph directly.

### 3. Importing multiple Web Awesome component bundles separately can create duplicate registrations

When `wa-button` and `wa-input` were imported from separate rewritten bundle URLs, shared internal dependencies such as `wa-icon` could be defined more than once.

Observed failure mode:

```text
Failed to execute 'define' on 'CustomElementRegistry': the name "wa-icon" has already been used with this registry
```

Incorrect for this repo:

```js
import 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/components/button/button.js';
import 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/components/input/input.js';
```

Correct for this repo at app bootstrap time:

```js
// index.html or app bootstrap module
import {
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
startLoader();
```

This gives Web Awesome one loader-driven registration path instead of multiple independent bundle entry points.

### 4. The loader does not auto-run just because you imported it

The loader module exports functions such as `startLoader`, `discover`, and `allDefined`. Importing the module alone was not sufficient in this setup.

Incorrect:

```js
import 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';
```

Correct at app bootstrap time:

```js
// index.html or app bootstrap module
import {
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
startLoader();
```

### 5. The autoloader discovers light DOM, not Lit shadow DOM

This matters a lot in this codebase because the actual Web Awesome controls are rendered inside Lit components.

If the loader only scans the main document and the `wa-*` elements do not exist until Lit renders inside a shadow root, the loader can miss them.

Correct in this repo, on the light-DOM host that exists before Lit renders shadow content:

```html
<task-manager-app data-wa-preload="wa-button wa-input"></task-manager-app>
```

That preload list tells the loader what to define even before those tags show up inside shadow DOM.

::: {.callout-tip}
Important distinction:

- `data-wa-preload` is a declarative loader configuration on the host element, it is visible in the light DOM, where it seems like a `data-*` attribute that the Web Awesome loader can read directly.
- `task-manager-app` does not consume that attribute unless the component code explicitly calls `getAttribute('data-wa-preload')`
- in the current repo, the consumer is the Web Awesome loader, not the Lit component
:::

Lit component code still just renders the elements normally:

```js
// components/task-composer.js
render() {
  return html`
    <wa-input name="task" .value=${this.value} @wa-input=${this.handleInput}></wa-input>
    <wa-button variant="brand" type="submit">+</wa-button>
  `;
}
```

Incorrect pattern: render `wa-*` elements only inside shadow DOM and do nothing at app bootstrap time to preload or discover them.

```html
<!-- index.html -->
<task-manager-app></task-manager-app>
```

```js
// components/task-composer.js
render() {
  return html`
    <wa-input name="task"></wa-input>
    <wa-button variant="brand">+</wa-button>
  `;
}
```

In that pattern, the page-level loader may never see those tags because they are created later inside Lit shadow roots.

Correct pattern: preload the shadow-DOM components from the light-DOM host during app bootstrap.

```html
<!-- index.html -->
<task-manager-app data-wa-preload="wa-button wa-input"></task-manager-app>
```

```js
// app bootstrap module
import {
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
startLoader();
import './script.js';
```

It did not, and that was a major reason the button appeared broken or never upgraded.

### 6. Lit state changes and visible Web Awesome input state can drift

After submit, the component state was cleared, but the visible `wa-input` value did not immediately reflect that reset in the rendered control.

The working fix in this repo is to keep the rendered `wa-input` synchronized in the Lit component lifecycle.

Correct pattern used here:

```js
updated(changedProperties) {
  if (!changedProperties.has('value')) {
    return;
  }

  const input = this.renderRoot?.querySelector('wa-input');
  if (input && input.value !== this.value) {
    input.value = this.value;
  }
}
```

This is not a universal rule for every Web Awesome component, but it was needed here to keep the visible field state aligned after submit.

## Correct Patterns

### Correct pattern: use Web Awesome events, not native assumptions

```js
<wa-input
  name="task"
  .value=${this.value}
  @wa-input=${this.handleInput}
></wa-input>
```

The component emits Web Awesome events such as `wa-input`. Treating it exactly like a native `<input>` is a bad assumption.

### Correct pattern: style with tokens and parts

The composer is customized with Web Awesome CSS custom properties and `::part()` hooks.

```css
wa-input {
  --wa-form-control-height: 60px;
  --wa-form-control-border-radius: 16px;
  --wa-input-background-color: color-mix(in srgb, var(--panel-background) 92%, transparent);
  --wa-input-border-color: color-mix(in srgb, var(--text-strong) 14%, transparent);
  --wa-input-border-color-focus: var(--accent);
}

wa-button {
  --wa-form-control-height: 60px;
  --wa-form-control-border-radius: 16px;
}

wa-button::part(base) {
  min-height: 60px;
  border-radius: 16px;
}
```

This is the right level to customize Web Awesome in a Lit component.

### Correct pattern: keep component layout in Lit, keep control behavior in Web Awesome

The app still uses Lit for composition, events, state, and rendering. Web Awesome provides the actual controls.

That split is working well here:

- Lit owns the task state and submit handling.
- Web Awesome owns the control rendering and accessibility behavior.
- Component-local styles adapt Web Awesome tokens to the app's visual language.

## Incorrect Patterns

### Incorrect pattern: waiting instead of registering

```js
customElements.whenDefined('wa-button');
```

This is not a substitute for loading or defining the component.

### Incorrect pattern: assuming a loader import is enough

```js
import 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';
```

For this repo, we had to call `startLoader()` explicitly.

### Incorrect pattern: relying on raw npm CDN modules in a no-build app

```js
import 'https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.5.0/dist/components/input/input.js';
```

This exposed unresolved bare imports in the browser.

### Incorrect pattern: assuming autoload sees into Lit shadow DOM

```text
If the custom element tag exists somewhere in the app, the loader will find it.
```

Not reliable here. We needed `data-wa-preload`.

### Incorrect pattern: treating `wa-input` exactly like a native input in every case

This caused the visible field value to stay stale after submit until the component explicitly synchronized it.

## What Needed To Be Customized In This Repo

The following customizations were necessary to make Web Awesome work and look correct in this app.

### 1. Loader base path

Without this, the loader tried to fetch broken paths such as `/components/button/button.js`.

```js
setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
```

### 2. Preloading components used inside shadow DOM

```html
<task-manager-app data-wa-preload="wa-button wa-input"></task-manager-app>
```

### 3. Control sizing to match the existing composer

The app required the add button and input to match the established 60px composer height and rounded shape.

```css
wa-input {
  --wa-form-control-height: 60px;
  --wa-form-control-border-radius: 16px;
}

wa-button {
  --wa-form-control-height: 60px;
  --wa-form-control-border-radius: 16px;
}
```

### 4. Button internals via `::part()`

The button needed additional control over its inner base sizing and label scale.

```css
wa-button::part(base) {
  min-height: 60px;
  border-radius: 16px;
}

wa-button::part(label) {
  font-size: 1.5rem;
}
```

### 5. Theme adaptation to the existing app variables

The app already had its own tokens such as `--panel-background`, `--text-strong`, `--text-muted`, and `--accent`. Web Awesome controls were customized to consume those values rather than imposing a separate theme system.

### 6. Value synchronization after submit

The visible `wa-input` needed explicit synchronization after Lit state reset.

## Chrome DevTools Workflow Used In This Project

The browser debugging approach on this repo was straightforward and very effective.

### 1. Check the custom element registry first

When the button was visually wrong, the first useful question was not "is the CSS wrong?" but "is `wa-button` even defined?"

That quickly separated styling problems from registration problems.

Useful check:

```js
!!customElements.get('wa-button')
!!customElements.get('wa-input')
```

### 2. Use the console to catch module-resolution and duplicate-definition failures

The console revealed the real breakages:

- unresolved bare module specifiers such as `lit/decorators.js`
- duplicate custom element definition errors such as `wa-icon`
- loader warnings about failed autoload paths

Without the console, these looked like generic rendering bugs.

### 3. Use the network panel to see what the loader is actually requesting

The network view was critical for finding path mistakes.

Examples we caught:

- raw package modules loading from `jsdelivr` but failing later due to bare imports
- loader requests going to the wrong location such as `/components/button/button.js`
- pending requests that showed the loader was trying to autoload modules but resolving the wrong base path

That is what led directly to `setBasePath(...)`.

### 4. Inspect shadow roots, not just the document DOM

Because the app is built with Lit, the interesting UI is inside shadow DOM. Looking only at the top-level document gives incomplete answers.

We checked:

- whether `<task-manager-app>` had a shadow root
- whether `<task-composer>` existed inside it
- whether `<wa-input>` and `<wa-button>` existed inside the composer's shadow root

That confirmed whether the problem was registration, rendering, or styling.

### 5. Run tiny smoke tests from the console

Instead of guessing whether the controls worked, we tested behavior directly:

- set the `wa-input` value
- dispatch `wa-input`
- submit the form
- verify the task list length changed
- verify the visible input cleared

That was especially useful for catching the value-sync issue after submit.

### 6. Distinguish benign console noise from root-cause errors

This project still shows unrelated noise such as a favicon `404` and a generic form-field warning. Those were not the cause of the button issue.

We also saw background probes from the browser or installed tooling checking for things such as `Babel` or `Compose`-related resources. Those requests were not part of the app's own Web Awesome or Lit module graph.

The practical rule is:

- if the request or error is not reachable from `index.html`, `script.js`, or the modules they import, treat it as environmental noise first
- if the request comes from the Web Awesome loader path, the Lit module graph, or the app's own static assets, treat it as relevant until proven otherwise

The useful debugging discipline here was:

- prioritize module resolution errors
- prioritize custom element registration errors
- prioritize failed component autoload warnings
- ignore unrelated noise until the core component path is healthy

## Current Recommendation For This Repo

For this exact codebase:

- keep Lit as the application and state layer
- keep Web Awesome as the control layer
- keep Web Awesome CSS on a standard CDN
- use the Web Awesome loader from `esm.sh`
- call `setBasePath(...)`
- call `startLoader()` explicitly
- preload any `wa-*` elements that are only created inside Lit shadow roots
- style controls through tokens and parts rather than trying to restyle internals blindly

That combination is the most reliable pattern we found for a static, no-build Lit app.