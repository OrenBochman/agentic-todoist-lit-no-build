import {
  discover,
  setBasePath,
  startLoader,
} from 'https://esm.sh/@awesome.me/webawesome@3.5.0/dist/webawesome.loader.js';

let loaderStarted = false;

export const ensureWebAwesomeLoader = () => {
  if (loaderStarted) {
    return;
  }

  setBasePath('https://esm.sh/@awesome.me/webawesome@3.5.0/dist/');
  startLoader();
  loaderStarted = true;
};

export const discoverWebAwesome = async (root) => {
  ensureWebAwesomeLoader();

  if (root) {
    await discover(root);
  }
};