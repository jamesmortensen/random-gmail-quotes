// randomQuoteContentScript.js

/**

The MIT License (MIT)

Copyright (c) 2013, 2014, 2022 James Mortensen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


/* 
 * This content script in injected into the page to modify the DOM by inserting the
 * quotes into the page.
 */

/**
 * This object is exposed to the outside of the content script module to allow 
 * the extension page action to update the quotes on a save event.
 */
var randomQuoteModule = {
    init: false,
    messageBox: null,
    quotes: null,
    loaded: false
};


/**
 * Pull the quotes out of storage, or load the defaults from quotes.js, if none found
 */
chrome.storage.local.get(null, function (items) {
    //console.debug("items = " + JSON.stringify(items) );
    if (items["m_quotes"] == null) {
        items["m_quotes"] = m_quotes;
        chrome.storage.local.set(items);
    }
    m_quotes = items["m_quotes"];

    randomQuoteModule.quotesLoaded = true;
    if (randomQuoteModule.pageLoaded == true && randomQuoteModule.quotesLoaded == true) {
        loadStageTwo();
    }

});


window.addEventListener("load", function () {
    randomQuoteModule.pageLoaded = true;
    if (randomQuoteModule.pageLoaded == true && randomQuoteModule.quotesLoaded == true) {
        loadStageTwo();
    }
});


/**
 * This runs once two conditions are met: The page has loaded, and the quotes have loaded.
 */
function loadStageTwo() {
    if (randomQuoteModule.init == true) return;

    randomQuoteModule.init = true;
    randomQuoteModule.quotes = m_quotes;

    function injectQuoteInTextarea() {

        let messageBox = null;
        messageBox = $('[g_editable="true"]').eq($('[g_editable="true"]').length - 1);

        if (messageBox.hasClass('sigadded')) return;

        if (isNotAMessageBodyTextarea(messageBox)) 
            return;

        if (isComposing(messageBox) || isReplying(messageBox)) {
            messageBox.addClass('sigadded');
            messageBox.action = messageBox.append;

        } else {
            // there is no textarea to inject into...
            messageBox = null;
        }

        if (textAreaExists(messageBox)) {
            injectQuote(messageBox);
        }
    }

    function isNotAMessageBodyTextarea(messageBox) {
        return messageBox.attr('aria-label') != "Message Body";
    }

    function isComposing(messageBox) {
        return messageBox.find('div.gmail_quote').html() == undefined && messageBox.html() != undefined
            && messageBox.parent().parent().parent().parent().parent().parent().parent().parent().parent().find('[aria-label="Show trimmed content"]').length == 0;
    }

    function isReplying(messageBox) {
        return messageBox.html() != undefined
            && messageBox.parent().parent().parent().parent().parent().parent().parent().parent().parent().find('[aria-label="Show trimmed content"]').length != 0;
    }

    function textAreaExists(messageBox) {
        return messageBox != null && messageBox.action == messageBox.append;
    }

    function injectQuote(messageBox) {
        setTimeout(async function () {
            messageBox.action("<br><br>" + await getRandomQuote() + "<br><br>");
        }, 1000);
    }

    /**
     * Get a random quote from the loaded quote list.
     *
     * @return {String} A quote randomly selected.
     */
    async function getRandomQuote() {

        randomQuoteModule.quotes = (await chrome.storage.local.get('m_quotes')).m_quotes;
        console.log('updated quote = ' + randomQuoteModule.quotes[29]);

        var len = randomQuoteModule.quotes.length;

        var index = (new Date().getTime() % len);

        return randomQuoteModule.quotes[29];
    }


    /**
     * When DOM nodes are inserted in the page, look for a compose window and inject.
     */
    window.addEventListener("DOMNodeInserted", function () {
        injectQuoteInTextarea();
    }, false);
}


/**
 * Quick sanity check to make sure algorithm doesn't play favorites with any quotes.
 */
var sanityCheck = function () {
    var a = [];
    for (var i = 0; i < m_quotes.length; i++) {
        a.push(0);
    }
    var _t = 1376899008256;
    for (var i = 0; i < 138; i++) {
        var index = ((_t + i) % m_quotes.length); console.log(index); a[index]++;
    }
};

