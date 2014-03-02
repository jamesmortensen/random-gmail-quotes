/* 
 * Copyright 2013, James Mortensen
 *
 * In case it isn't clear, this is licensed under the MIT License. So do with this what you please.
 *
 */
 

function onRequest(request, sender, sendResponse) {
  // Show the page action for the tab that the sender (content script)
  // was on.
  chrome.pageAction.show(sender.tab.id);

  // Return nothing to let the connection be cleaned up.
  sendResponse({});
};

// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);



chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.info("onMessage :: ");

});