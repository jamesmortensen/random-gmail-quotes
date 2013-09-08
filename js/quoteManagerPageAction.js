/* 
 * Copyright 2013, James Mortensen
 *
 *
 * This is a PageAction to allow power users to replace the quotes without hacking the code.
 *
 */

	 
chrome.storage.local.get(null, function(items) {
    console.log("items = " + JSON.stringify(items) );iii = items;
    if(items["m_quotes"] == null) {
        items["m_quotes"] = m_quotes;
        chrome.storage.local.set(items);
    }
    m_quotes = items["m_quotes"];

    //$('[data-value="quotes"]').html( formatter.formatJson(JSON.stringify(m_quotes)) );
    $('[data-value="quotes"]').html( JSON.stringify(m_quotes) );

});

window.addEventListener("load", function() {
	
	$('[data-action="save"]').click(function() {
		var items = {};
		items["m_quotes"] = JSON.parse( $('[data-value="quotes"]').val() );
		//items["m_quotes"] = ["<img src=\"http://se-flair.appspot.com/png/921455be-18e4-481e-ba1a-ba1d30998061/\" />","James was here!!!!!!"];
		chrome.storage.local.set(items);
		//chrome.tabs.executeScript(null,{code:"document.body.dataset['quote'] = 'fasfdtest';document.body.style.backgroundColor='orange';"});

	});

	$('[data-action="cancel"]').click(function() {
        window.close();
	});

}, false);