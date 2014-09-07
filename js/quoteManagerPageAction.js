/* 
 * Copyright 2013, 2014 James Mortensen
 *
 *
 * This is a PageAction to allow power users to replace the quotes without hacking the code.
 *
 */

function getListQuoteTemplate() {
    return '<li class="list-group-item quote"><input /><span class="remove-quote glyphicon glyphicon-minus"></span></li>';
}

function loadQuotes(items) {
	
    console.log("items = " + JSON.stringify(items) );iii = items;
    if(items["m_quotes"] == null) {
        items["m_quotes"] = m_quotes;
        chrome.storage.local.set(items);
    }
    m_quotes = items["m_quotes"];

    //$('[data-value="quotes"]').html( formatter.formatJson(JSON.stringify(m_quotes)) );
    $('[data-value="quotes"]').html( JSON.stringify(m_quotes) );

    var listQuoteTemplate = getListQuoteTemplate();
    for(var i = 0; i < m_quotes.length; i++) {
    	var listItem = $(listQuoteTemplate);
    	listItem.find('input').val(m_quotes[i]);
    	$('.list-group').append(listItem);
    }

    var firstElem = $('.list-group-item:first').find('input');
    updateQuotePreview(firstElem);
}


function updateQuotePreview(targetElem) {
	var quote = $(targetElem).val();
	console.debug('' + quote);
	$('.preview').html(quote);
}


function storeQuotes(quotesToStore, doClose) {
	chrome.storage.local.set(quotesToStore, function() {
		// chrome.tabs.getCurrent(function(tab) {
		// 	var tabId = tab.id;
		// 	var injectDetails = {
		// 		code: 'm_quotes = ' + quotesToStore.m_quotes
		// 	};
		// 	chrome.tabs.executeScript(tabId, injectDetails, function(results) {
		// 		console.log(results);
		// 	});
	        
		// });
		if(doClose)
		    window.close();
	});
}


function saveQuotes(doClose) {
	var quoteElements = $('.list-group-item.quote input');
	var quoteCollection = [];
	for(var i = 0; i < quoteElements.length; i++) {
		var quote = quoteElements.eq(i).val();
		if(quote.length > 0)
			quoteCollection.push(quote);
		if(typeof quote !== 'string') {
			console.error('There was a problem with the quotes. Not saving!');
			return;
		}
	}
	console.log(quoteCollection);
	var quotesToStore = {};
	quotesToStore.m_quotes = quoteCollection;
	storeQuotes(quotesToStore, doClose);
}


function promptForQuoteRemoval(event) {
	var listElem = $(event.target).parent();
	var quote = listElem.find('input').val();
	console.log('quote to remove = ' + quote);
	listElem.addClass('alert').addClass('alert-danger');
	$('.prompt-delete').fadeIn();
}


function removeQuoteAndSave(event) {
	$('.list-group .quote.alert-danger').remove();
	$('[data-action="remove-quote"]').parent().fadeOut();
	var newLastElem = $('.list-group li:last input');
	updateQuotePreview(newLastElem);
	$('.list-group li:last input').focus();
	var doClose = false;
	saveQuotes(doClose);
}


function addQuoteListBox() {
	var listQuoteTemplate = getListQuoteTemplate();
	$('.list-group').append(listQuoteTemplate);
	$('.quote-list')[0].scrollTop = $('.quote-list')[0].scrollHeight;
	$('.list-group li:last input').focus();
}


/**
 * For ease of development. I'm not sure of an easier way to do this, but this allows developers to
 * work with the PageAction panels in the browser, with an http server live reload plugin.
 */
if(typeof chrome.storage === 'undefined')
	var chrome = {
		storage: {
		    local: {
		        get: function(_null, callback) { 
					var script = document.createElement('script');
					script.setAttribute('src', '/quotes.js');
					script.addEventListener('load', function() {
						//callback(m_quotes);
					});
					document.head.appendChild(script);
				},
				set: function() { }
			}
		}
	};



window.addEventListener("load", function() {

	chrome.storage.local.get(null, loadQuotes);
	
	/**
	 * This is the save action for the JSON panel, which we keep simply for backwards compatibility.
	 */
	$('[data-action="save"]').click(function() {
		var items = {};
		if($('[data-value="quotes"]').val().match(/\[\".*/g) != null) {
		    items["m_quotes"] = JSON.parse( $('[data-value="quotes"]').val() );
		} else {
			items["m_quotes"] = [$('[data-value="quotes"]').val()];
		}
		chrome.storage.local.set(items, function() {
			window.close();
		});
		//chrome.tabs.executeScript(null,{code:"document.body.dataset['quote'] = 'fasfdtest';document.body.style.backgroundColor='orange';"});
	});

	/**
	 * Close the panel.
	 */
	$('[data-action="cancel"]').click(function() {
        window.close();
	});

	/**
	 * Show the "old" JSON panel most people don't like, and be able to switch back.
	 */
	$('[data-action="json-panel"]').click(function() {
		window.location.href = '/quoteManagerPageAction.html';
	});
	$('[data-action="list-panel"]').click(function() {
		window.location.href = '/quoteManagerPageActionSimple.html';
	});

	/**
	 * This is the save operation for the new UX friendly list panel.
	 */
	$('[data-action="save-list"]').click(function() {
		var doClose = true;
		saveQuotes(doClose);
	});

	/**
	 * Add a textbox and focus it.
	 */
	$('[data-action="add-quote"]').click(addQuoteListBox);

	/**
	 * On click of a list item and on every keystroke, update the quote preview.
	 */
	$('.list-group').on('click keyup', '.quote input', function(elem) { updateQuotePreview(elem.target); });

	/**
	 * Prompt for removal of any quotes selected.
	 */
	$('.list-group').on('click', '.quote .remove-quote', promptForQuoteRemoval);

	/**
	 * Remove the selected quotes from the UI and save all changes.
	 */
	$('[data-action="remove-quote"]').click(removeQuoteAndSave);
	
	/**
	 * Uncheck items marked for deletion.
	 */
	$('[data-action="keep-quote"]').click(function() {
		$('.list-group .quote.alert-danger').removeClass('alert').removeClass('alert-danger');
		$(this).parent().fadeOut();	
	});
	

}, false);