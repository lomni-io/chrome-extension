
chrome.runtime.onConnectExternal.addListener(function(port) {
    console.log("onConnectExternal", port)

    chrome.tabs.onActivated.addListener((info) =>{
        chrome.tabs.query({currentWindow: true}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });

    });

    chrome.tabs.onRemoved.addListener((tabId, removedInfo) =>{
        chrome.tabs.query({currentWindow: true}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });
    })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>{
        chrome.tabs.query({currentWindow: true}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });
        console.log("onUpdated", tabId, changeInfo, tabId)
    })

    port.onMessage.addListener(function(msg) {
        console.log('new message:: ', msg)

        if (msg.kind === 'all-tabs-request') {
            chrome.tabs.query({currentWindow: true}, tabs => {
                port.postMessage({
                    kind: 'all-tabs-response',
                    data: tabs
                });
                console.log('all-tabs-request:: ', tabs)
            });
        }
        if (msg.kind === 'open-request-existing-tab') {
            chrome.tabs.update(msg.tab, {active: true})
        }
        if (msg.kind === 'pin-tab') {
            chrome.tabs.update(msg.tab, {pinned: true})
        }
        if (msg.kind === 'unpin-tab') {
            chrome.tabs.update(msg.tab, {pinned: false})
        }
        if (msg.kind === 'open-request-new-tab') {
            chrome.tabs.create({
                url: msg.url
            });
        }
        if (msg.kind === 'open-request') {
            chrome.tabs.query({currentWindow: true, url: msg.data.url}, tabs => {
                if (tabs.length > 0){
                    chrome.tabs.update(tabs[0].id, {active: true})
                }else{
                    if (msg.data.option === 'new'){
                        chrome.tabs.create({
                            url: msg.data.url
                        });
                    }else{
                        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
                            chrome.tabs.update(tabs[0].id, {url: msg.data.url})
                        })
                    }

                }
            })
        }
    })
})
