// randomQuoteModule.user.js

/**

The MIT License (MIT)

Copyright (c) 2013, 2014 James Mortensen

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
var randomQuoteModule = {};


/**
 * bug: exclude/include userscript headers don't work in Chrome, so we filter manually
 */
if(window.location.hostname.match(/mail.google.com/) != null) {

    /**
     * Insert the browser action icon in the address bar
     */
    chrome.extension.sendRequest({}, function(response) {});

    randomQuoteModule = {
        init: false,
        messageBox: null,
        quotes: null,
        loaded: false
    };


    /**
     * Pull the quotes out of storage, or load the defaults from quotes.js, if none found
     */
    chrome.storage.local.get(null, function(items) {
        console.log("items = " + JSON.stringify(items) );
        if(items["m_quotes"] == null) {
            items["m_quotes"] = m_quotes;
            chrome.storage.local.set(items);
        }
        m_quotes = items["m_quotes"];

        randomQuoteModule.quotesLoaded = true;
        if(randomQuoteModule.pageLoaded == true && randomQuoteModule.quotesLoaded == true) {
            loadStageTwo();
        }

    });

    window.addEventListener("load", function() { 
        randomQuoteModule.pageLoaded = true;
        if(randomQuoteModule.pageLoaded == true && randomQuoteModule.quotesLoaded == true) {
            loadStageTwo();
        } 
    });
        

    /**
     * This runs once two conditions are met: The page has loaded, and the quotes have loaded.
     */
    function loadStageTwo() {
        if(randomQuoteModule.init == true) return;
        
        randomQuoteModule.init = true;
        randomQuoteModule.quotes = m_quotes;


        /**
         * This handles injecting the quote into the Gmail compose textarea.
         */
        function injectQuoteInTextarea() {

            var messageBox = null;
            messageBox = $('[g_editable="true"]').eq($('[g_editable="true"]').length-1);

            if(messageBox.hasClass('sigadded')) return;

            /**
             * Don't inject quotes in the textareas in the settings page, that's just not cool...
             */
            if(messageBox.attr('aria-label') != "Message Body") return;
            
            /**
             * There's no quote block, so inject at the bottom
             */
            if(messageBox.find('div.gmail_quote').html() == undefined && messageBox.html() != undefined
                  && messageBox.parent().parent().parent().parent().parent().parent().parent().parent().parent().find('[aria-label="Show trimmed content"]').length == 0) {
                
                
                messageBox.addClass('sigadded');
                messageBox.action = messageBox.append;

            // saying no to injecting quoets in replies for now...
            /*} else if(messageBox.html() != undefined 
                    && messageBox.parent().parent().parent().parent().parent().parent().parent().parent().parent().find('[aria-label="Show trimmed content"]').length != 0) {
                console.info("There's a quote, so let's go ahead and insert a quote before the reply...");
                messageBox.addClass('sigadded');
                messageBox.find('div.gmail_quote').before("Reply Sig goes here<br><br>");
                messageBox.find('.gmail_extra').find('div[dir="ltr"]').append("HRYHRYR");
                //messageBox = $('[g_editable="true"]').find('div.gmail_quote');
                messageBox.action = messageBox.before;
                messageBox=null;*/

            } else {

                // there is no textarea to inject into...
                messageBox = null;
            }

            /**
             * Assuming there is a textarea, inject a quote
             */
            if(messageBox != null && messageBox.action == messageBox.append) {
                setTimeout(function() {
                    messageBox.action("<br><br>"+getRandomQuote()+"<br><br>");
                }, 1000);
            }   
        }

        
        /**
         * Get a random quote from the loaded quote list.
         *
         * @return {String} A quote randomly selected.
         */
        function getRandomQuote() {
            
            var len = randomQuoteModule.quotes.length;

            var index = (new Date().getTime() % len);

            return randomQuoteModule.quotes[index];
        }            
        

        /**
         * When DOM nodes are inserted in the page, look for a compose window and inject.
         */
        window.addEventListener("DOMNodeInserted", function() {

            injectQuoteInTextarea();
            
        }, false);
            
    }


    /**
     * Quick sanity check to make sure algorithm doesn't play favorites with any quotes.
     */
    var sanityCheck = function() {
        var a=[];for(var i = 0;i<m_quotes.length;i++) { a.push(0);}var _t = 1376899008256; for(var i = 0; i <138; i++) { var index = ((_t+i) % m_quotes.length); console.log(index); a[index]++;}
    };


    /**
     * Expose the quotes to the outside of the content script module to allow 
     * the extension page action to update the quotes on a save event.
     */
    unsafeWindow.randomQuoteModule = randomQuoteModule;

}
