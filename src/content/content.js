"use strict";

browser.runtime
  .sendMessage({ type: "getRegisteredScripts" })
  .then((options) => {
    document.addEventListener("DOMContentLoaded", () => {
      if (options.length > 0) {
        document.body.classList.add(...options);
      }

      document.body.style.display = "block";
    });
  });

browser.runtime.onMessage.addListener(({ type, options }) => {
  switch (type) {
    case "removeStyles":
      document.body.classList.remove(...options);
      break;

    case "addStyles":
      document.body.classList.add(...options);
      break;

    default:
      break;
  }
});
