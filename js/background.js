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

// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  console.info("If the letter 'g' is found in the tab's URL...");
  if (tab.url.indexOf('/users/') > -1) {
    console.info("show the page action.");
    chrome.pageAction.setPopup({tabId:tabId, popup:"seFlairPageAction.html"});

    chrome.pageAction.show(tabId);
  }
};
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.info("onMessage :: ");
    /*chrome.tabs.query({
        active: true,               // Select active tabs
        lastFocusedWindow: true     // In the current window
    }, function(array_of_Tabs) {
        // Since there can only be one active tab in one active window, 
        //  the array has only one element
        var tab = array_of_Tabs[0];
        // Example:
        var url = tab.url;
        // ... do something with url variable
        console.info(url);
    });*/


});