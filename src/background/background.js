'use strict';

// if user clicks on the action button, open Yandex in a new tab.
browser.browserAction.onClicked.addListener(function () {
  browser.tabs.create({
    url: browser.i18n.getMessage('browser_action_url')
  });
});
