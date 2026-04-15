// Uses the official Web Awesome hosted CDN.
// The loader is bootstrapped via <script type="module" src="..."> in each test
// HTML page, which auto-detects its base path from the script src attribute.
// This module imports discover from the same URL to share the loader instance.
import {
  discover,
} from 'https://ka-f.webawesome.com/webawesome@3.5.0/webawesome.loader.js';

const DEFAULT_TAGS = ['wa-button', 'wa-icon', 'wa-input'];

export const whenAllDefined = (tagNames) =>
  Promise.all(tagNames.map(async (tagName) => {
    await customElements.whenDefined(tagName);
    // Diagnostic log for registration
    console.log(`[diagnostic] custom element defined: ${tagName}`);
  }));

// Tell the loader to discover wa-* tags inside `host`, then wait for them to register.
export const discoverWebAwesome = async (host, requiredTags = DEFAULT_TAGS) => {
  host.setAttribute('data-wa-preload', requiredTags.join(' '));
  await discover(host);
  await whenAllDefined(requiredTags);
};