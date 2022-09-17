// quoteManagerPageAction.js

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


/** 
 * This is a PageAction to allow power users to replace the quotes without hacking the code.
 */

/**
 * Global variable to help smooth out the save alert by only allowing one timeout to run
 * at a time.
 */
var g_saveTimeout = 0;

var keyFilterer;
if (typeof KeyFilterer !== 'undefined')
    keyFilterer = new KeyFilterer();

var elementFader;

function getListQuoteTemplate() {
    return '<li class="list-group-item quote"><input /><span class="remove-quote glyphicon glyphicon-minus"></span></li>';
}

function loadQuotes(items) {

    if (items["m_quotes"] == null) {
        items["m_quotes"] = m_quotes;
        chrome.storage.local.set(items);
    }
    m_quotes = items["m_quotes"];

    $('[data-value="quotes"]').html(JSON.stringify(m_quotes));

    var listQuoteTemplate = getListQuoteTemplate();
    for (var i = 0; i < m_quotes.length; i++) {
        var listItem = $(listQuoteTemplate);
        listItem.find('input').val(m_quotes[i]);
        $('.list-group').append(listItem);
    }

    var firstElem = $('.list-group-item:first').find('input');
    updateQuotePreview(firstElem);
}


function updateQuotePreview(targetElem) {
    var quote = $(targetElem).val();
    //console.debug('' + quote);
    $('.preview').html(quote);
}


function storeQuotes(quotesToStore, doClose) {
    chrome.storage.local.set(quotesToStore, function () {

        /**
         * Smoothes out the success alert message fadeIn/fadeOut.
         */
        clearTimeout(g_saveTimeout);
        g_saveTimeout = setTimeout(function () {
            //$('.modal-footer span.auto-save').fadeOut();
            elementFader.fadeOut();
        }, 250);

        if (doClose)
            window.close();
    });
}


function showAutoSaveMessage() {
    if ($('.alert-danger:visible').length === 0) {
        //$('.modal-footer span.auto-save').fadeIn();
        elementFader.fadeIn();
    }
}


function saveQuotes(doClose) {
    showAutoSaveMessage();
    var quoteElements = $('.list-group-item.quote input');
    var quoteCollection = [];
    for (var i = 0; i < quoteElements.length; i++) {
        var quote = quoteElements.eq(i).val();
        if (quote.length > 0)
            quoteCollection.push(quote);
        if (typeof quote !== 'string') {
            console.error('There was a problem with the quotes. Not saving!');
            return;
        }
    }
    //console.debug(quoteCollection);
    var quotesToStore = {};
    quotesToStore.m_quotes = quoteCollection;
    storeQuotes(quotesToStore, doClose);
}


function promptForQuoteRemoval(event) {
    var listElem = $(event.target).parent();
    var quote = listElem.find('input').val();
    //console.debug('quote to remove = ' + quote);
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
if (typeof chrome.storage === 'undefined')
    var chrome = {
        storage: {
            local: {
                get: function (_null, callback) {
                    var script = document.createElement('script');
                    script.setAttribute('src', '/quotes.js');
                    script.addEventListener('load', function () {
                        callback(m_quotes);
                    });
                    document.head.appendChild(script);
                },
                set: function () { }
            }
        }
    };



window.addEventListener("load", function () {

    elementFader = new ElementFader('.modal-footer span.auto-save');

    chrome.storage.local.get(null, loadQuotes);

    /**
     * This is the save action for the JSON panel, which we keep simply for backwards compatibility.
     */
    $('[data-action="save"]').click(function () {
        var items = {};
        if ($('[data-value="quotes"]').val().match(/\[\".*/g) != null) {
            items["m_quotes"] = JSON.parse($('[data-value="quotes"]').val());
        } else {
            items["m_quotes"] = [$('[data-value="quotes"]').val()];
        }
        chrome.storage.local.set(items, function () {
            window.close();
        });
    });

    /**
     * Close the panel.
     */
    $('[data-action="cancel"]').click(function () {
        window.close();
    });

    /**
     * Show the "old" JSON panel most people don't like, and be able to switch back.
     */
    $('[data-action="json-panel"]').click(function () {
        window.location.href = '/quoteManagerPageAction.html';
    });
    $('[data-action="list-panel"]').click(function () {
        window.location.href = '/quoteManagerPageActionSimple.html';
    });

    /**
     * Add a textbox and focus it.
     */
    $('[data-action="add-quote"]').click(addQuoteListBox);

    /**
     * On every keystroke, or on cut/paste, update the quote preview.
     */
    $('.list-group').on('keyup cut paste', '.quote input', function (event) {
        updateQuotePreview(event.target);
        var doClose = false;
        if (event.type === 'keyup') {
            //console.debug(event.keyCode + ' ::shift' + event.shiftKey + ' ::alt' + event.altKey + ' ::ctrl' + event.ctrlKey + ' ::meta' + event.metaKey);
            var isValidKey = keyFilterer.isValidKey(event.keyCode);
            if (isValidKey) {
                saveQuotes(doClose);
            }
        } else if (event.type === 'cut' || event.type === 'paste') {
            setTimeout(function () {
                saveQuotes(doClose);
            }, 0);
        }
    });

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
    $('[data-action="keep-quote"]').click(function () {
        $('.list-group .quote.alert-danger').removeClass('alert').removeClass('alert-danger');
        $(this).parent().fadeOut();
    });


}, false);