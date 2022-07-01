'use strict';

// Write default options
browser.runtime.onInstalled.addListener(()=>{
  const options = {
    ya_search: false,
    ya_fonts: false,
    ya_font_size: false,
    ya_side_panel: false
  };

  browser.storage.local.set({ options });
});
