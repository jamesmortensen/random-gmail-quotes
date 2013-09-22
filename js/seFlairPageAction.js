var storage = {"accounts":{}};
var siteUser = {};

window.addEventListener("load", function() {
    
    $('[data-action="save"]').click(function() {
        var items = {};
        var accountId = storage.accounts[siteUser.site+'-'+siteUser.userId];
        items["m_quotes"] = ["<img src=\"http://se-flair.appspot.com/png/"+accountId+"/\" />"];
        
        chrome.storage.local.set(items, function() {
            window.close();
        });
        //chrome.tabs.executeScript(null,{code:"document.body.dataset['quote'] = 'fasfdtest';document.body.style.backgroundColor='orange';"});

    });

    $('[data-action="cancel"]').click(function() {
        window.close();
    });

    chrome.storage.local.get(null, function(items) {
        if(items != undefined && items.accounts != undefined) {
            storage = items;
        }
     
        getDetailsFromUrl();

    });
}, false);


function getDetailsFromUrl() {
    try {
        chrome.tabs.query({
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
            
            var urlSplit = url.match(/\/\/(.*)\.com\/users\/([0-9]*)\/(.*)/);
            siteUser = {site:urlSplit[1],userId: urlSplit[2],displayName:urlSplit[3] };
            var accountId = storage.accounts[siteUser.site+'-'+siteUser.userId];
            if(accountId == null) {
                console.log("getDataFromApi...");

                getDataFromApi(siteUser, storage, null);
            } else {
                loadFlair(accountId);
            }
        });
    } catch(e) {
        console.error("problem :: " + e.message);
    }
}
/*chrome.runtime.sendMessage("loadFlair", function(res) { 
    console.info("loadFlair sendmessage");
    console.info("url = " + res.url);

});*/


// This is used in development only to avoid hitting the quotas on the APIs
  // if you're doing development on this script, replace with your data from the API
function getDataFromApiTest(siteUser, storage, injectScript) {
    console.warn("Using CACHED DATA to avoid maxing out API...");
    xhr = {};
    xhr.readyState = 4;
    if(siteUser.site == "stackoverflow") {
       xhr.responseText = '{"items":[{"user_id":552792,"display_name":"jmort253","account_id":265671}],"quota_remaining":76,"quota_max":300,"has_more":false}';
    } else if(siteUser.site == "meta.stackoverflow") {
       xhr.responseText = '{"items":[{"user_id":155826,"display_name":"jmort253","account_id":265671}],"quota_remaining":76,"quota_max":300,"has_more":false}';
    } else if(siteUser.site == "pm" || siteUser.site == "meta.pm") {
        xhr.responseText = '{"items":[{"user_id":34,"display_name":"jmort253","account_id":265671}],"quota_remaining":76,"quota_max":300,"has_more":false}';
    } else if(siteUser.site == "workplace" || siteUser.site == "meta.workplace"){
        xhr.responseText = '{"items":[{"user_id":98,"display_name":"jmort253","account_id":265671}],"quota_remaining":76,"quota_max":300,"has_more":false}';
    } else {
        xhr.responseText = '{"items":[{"user_id":98,"display_name":"jmort253","account_id":265671}],"quota_remaining":76,"quota_max":300,"has_more":false}';
        siteUser.site = "workplace";
        siteUser.userId = 98;
        siteUser.accountId = 265671;

    }
    getAccountId(siteUser, storage, injectScript);
}



// get the accountId for the user from the API, and store it
function getDataFromApi(siteUser, storage, injectScript) {

    // for testing to avoid killing the SE API! Uncomment when developing/debugging
//    getDataFromApiTest(siteUser, storage, injectScript); return;

    console.info("get data from api");

    // get account id
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (function(siteUser, storage, injectScript) {
        return function() {
            getAccountId(siteUser, storage, injectScript);
        }
    })(siteUser, storage, injectScript);  // Implemented elsewhere.

    console.info("make request to " + "https://api.stackexchange.com/2.1/users?order=desc&sort=reputation&inname="+siteUser.displayName+"&site="+siteUser.site+"&filter=!*MxJcsxUhQG*kL8D");
    xhr.open("GET", "https://api.stackexchange.com/2.1/users?order=desc&sort=reputation&inname="+siteUser.displayName+"&site="+siteUser.site+"&filter=!*MxJcsxUhQG*kL8D", true);
    xhr.send();

}

// get the accountId from the API response
function getAccountId(siteUser, storage, injectScript) {
    //console.info("inside getAccountId...");
    if(xhr.readyState == 4) {
      //console.info("ready...");
//    if(xhr.status == 200) { alert("done")
        result = xhr.responseText;
        resultArr = JSON.parse(result).items;
        for(var i = 0; i < resultArr.length; i++) {
            if(siteUser.userId == resultArr[i].user_id) {
                siteUser.accountId = resultArr[i].account_id;
                break;
            }
        }
        console.info("accountId = " + siteUser.accountId);
        // init app
        storage.accounts[siteUser.site+"-"+siteUser.userId] = siteUser.accountId;
        if(!storage.stackApi) {
            storage.stackApi = {};
            storage.stackApi["account-"+siteUser.accountId] = {"newItemCol" : "", "account_id" : siteUser.accountId };
        }
        //console.info("storage accounts = " + JSON.stringify(storage.accounts));
        ext_s = storage;
        //console.info("inject data in page...");
        //injectScript(storage.stackApi["account-"+siteUser.accountId]);

        // storing the accountId with the site+userId combo for future pageloads and to avoid hitting the API needlessly
        chrome.storage.local.set(storage, function() {
               console.info("accounts data stored...");
           chrome.storage.local.get(null, function(s) {
               console.info("this is stored = " + JSON.stringify(s));
               loadFlair(siteUser.accountId);
           });
        });
    }

}


function loadFlair(accountId) {

    var flairUrl = "http://se-flair.appspot.com/png/"+accountId+"/";

    $('.seflair').append('<img src='+flairUrl+' alt="seflair" />');
}