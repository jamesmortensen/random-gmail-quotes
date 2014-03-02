/* 
 * Copyright 2013, James Mortensen
 *
 * In case it isn't clear, this is licensed under the MIT License. So do with this what you please.
 *
 */

var randomQuoteModule = {};

// bug: exclude/include userscript headers don't work in Chrome, so we filter manually
if(window.location.hostname.match(/mail.google.com/) != null) {

    // insert the browser action icon in the address bar
    chrome.extension.sendRequest({}, function(response) {});

     randomQuoteModule = {
        init: false,
        messageBox: null,
        quotes: null,
        loaded: false
    };

 
    // load jQuery from CDN...
    var script = document.createElement("script");
    script.setAttribute("src","//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js");
    document.getElementsByTagName("head")[0].appendChild(script);


    // function to inject jQuery onto the page, as well as the randomQuoteModule object
	function with_jquery(f, randomQuoteModule) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.textContent = "(" + f.toString() + ")(jQuery, "+JSON.stringify(randomQuoteModule)+")";
		document.body.appendChild(script);
	};

    // pull the quotes out of storage, or load the defaults from quotes.js if none found
    chrome.storage.local.get(null, function(items) {
        console.log("items = " + JSON.stringify(items) );iii = items;
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
        

    function loadStageTwo() {
        if(randomQuoteModule.init == true) return;
        
        randomQuoteModule.init = true;
        randomQuoteModule.quotes = m_quotes;
    	

        with_jquery(function($, randomQuoteModule) {

            // this handles injecting the quote into the Gmail compose textarea
            function injectQuoteInTextarea() {

                var messageBox = null;
                messageBox = $('[g_editable="true"]').eq($('[g_editable="true"]').length-1);

                if(messageBox.hasClass('sigadded')) return;

                // don't inject quotes in the textareas in the settings page, that's just not cool...
                if(messageBox.attr('aria-label') != "Message Body") return;


                
                
                // there's no quote block, so inject at the bottom
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

            // TODO: trying to allow updating the quotes without reloading -- in progress
            // top.window.updateRandomQuotes = function(quotes) {

            //     randomQuoteModule.quotes = quotes;
            // }
            

            // when DOM nodes are inserted in the page, look for a compose window and inject
            window.addEventListener("DOMNodeInserted", function() {

                    injectQuoteInTextarea();
                
            }, false);
            
             
    	}, randomQuoteModule);
            
    };

    // quick sanity check to make sure algorithm doesn't play favorites with any quotes
    function sanityCheck() {
        var a=[];for(var i = 0;i<m_quotes.length;i++) { a.push(0);}var _t = 1376899008256; for(var i = 0; i <138; i++) { var index = ((_t+i) % m_quotes.length); console.log(index); a[index]++;}
    }

}
