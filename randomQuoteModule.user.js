// ==UserScript==
// @name           Random Gmail Signature Quotes 
// @namespace      http://google.com 
// @author         jmort253 (http://stackoverflow.com/users/552792)
// @description    Chrome Extension to inject random quotes into Gmail signatures.
// @homepage       http://blog.opensourceopportunities.com
// @copyright      2013, James Mortensen (http://stackoverflow.com/users/552792/jmort253) 
// @license        MIT License or BSD License
// @version        0.9
// @include        https://*google.com/*
// @history        0.9 initial beta release to the public
// ==/UserScript==

/* 
 * Copyright 2013, James Mortensen
 *
 * I made this extension because I couldn't find a tool to let me randomly inject my own user-selected
 * quotes into my email signature. I specifically wanted the quotes to be hand-selected. 
 *
 * Since there wasn't an existing solution, I made one.
 *
 * To replace the quotes with your own, edite the quotes.js file. You may use HTML markup, but be sure
 * to escape your quotation marks!
 *
 * In case it isn't clear, this is licensed under the MIT License. So do with this what you please.
 *
 */


// bug: exclude/include userscript headers don't work in Chrome, so we filter manually
if(window.location.hostname.match(/mail.google.com/) != null) {


    var randomQuoteModule = {
        init: false,
        messageBox: null,
        quotes: null        
    };

 
    // load jQuery from CDN...
    var script = document.createElement("script");
    script.setAttribute("src","//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js");
    document.getElementsByTagName("head")[0].appendChild(script);


    // function to inject jQuery onto the page, as well as the randomQuoteModule object
	function with_jquery(f, randomQuoteModule) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.textContent = "(" + f.toString() + ")(jQuery, "+JSON.stringify(randomQuoteModule)+")";
		document.body.appendChild(script);
	};


    window.addEventListener("load", function() { 
        
        if(randomQuoteModule.init == true) return;
        
        randomQuoteModule.init = true;
        randomQuoteModule.quotes = m_quotes;

        // TODO: Use chrome.storage to store user-defined signatures and load them instead of the defaults
        if(false && window.localStorage.getItem("randomSigQuotes") != null) {
            randomQuoteModule.quotes = JSON.parse(window.localStorage.getItem("randomSigQuotes"));
        }
    	

        with_jquery(function($, randomQuoteModule) {

            // this handles injecting the quote into the Gmail compose textarea
            function injectQuoteInTextarea() {

                if($('[g_editable="true"]').hasClass('sigadded')) return;

                // don't inject quotes in the textareas in the settings page, that's just not cool...
                if($('[g_editable="true"]').attr('aria-label') == "Signature") return;


                var messageBox = null;

                
                // there's no quote block, so inject at the bottom
                if($('[g_editable="true"]').find('div.gmail_quote').html() == undefined && $('[g_editable="true"]').html() != undefined
                      && $('[g_editable="true"]').parent().parent().parent().parent().parent().parent().parent().parent().parent().find('[aria-label="Show trimmed content"]').length == 0) {
                    

                    $('[g_editable="true"]').addClass('sigadded');
                    //$('[g_editable="true"]').append("<br>Quote goes here<br><br>");
                    
                    messageBox = $('[g_editable="true"]');
                    messageBox.action = messageBox.append;

                // saying no to injecting quoets in replies for now...
                /*} else if($('[g_editable="true"]').html() != undefined) {
                    console.info("There's a quote, so let's go ahead and insert a quote before the reply...");
                    $('[g_editable="true"]').addClass('sigadded');
                    $('[g_editable="true"]').find('div.gmail_quote').before("Reply Sig goes here<br><br>");
                    messageBox = $('[g_editable="true"]').find('div.gmail_quote');
                    messageBox.action = messageBox.before;
                */

                } else {

                    // there is no textarea to inject into...
                    messageBox = null;
                }

                // assuming there is a textarea, inject a quote
                if(messageBox != null && messageBox.action == messageBox.append) {
                    setTimeout(function() {
                        messageBox.action("<br><br>"+getRandomQuote()+"<br><br>");
                    }, 1000);
                }
               
            }

            
            function getRandomQuote() {
                
                var len = randomQuoteModule.quotes.length;

                var index = (new Date().getTime() % len);

                return randomQuoteModule.quotes[index];
            }            
            

            // when DOM nodes are inserted in the page, look for a compose window and inject
            window.addEventListener("DOMNodeInserted", function() {

                    injectQuoteInTextarea();
                
            }, false);
            
             
    	}, randomQuoteModule);
            
    }, false);

}
