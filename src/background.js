
chrome.runtime.onConnectExternal.addListener(function(port) {
    console.log("onConnectExternal", port)

    chrome.tabs.onActivated.addListener((info) =>{
        chrome.tabs.query({}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });

    });

    chrome.tabs.onRemoved.addListener((tabId, removedInfo) =>{
        chrome.tabs.query({}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });
    })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>{
        chrome.tabs.query({}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });
        console.log("onUpdated", tabId, changeInfo, tabId)
    })

    chrome.tabs.onMoved.addListener((tabId, changeInfo) =>{
        chrome.tabs.query({}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });
    })


    chrome.tabGroups.onUpdated.addListener(group =>{
        chrome.tabGroups.query({}, groups => {
            port.postMessage({
                kind: 'all-tab-groups-response',
                data: groups
            });
        });
        console.log("onUpdatedGroup", group)
    })

    chrome.tabGroups.onMoved.addListener(group =>{
        chrome.tabs.query({}, tabs => {
            port.postMessage({
                kind: 'all-tabs-response',
                data: tabs
            });
        });
    })

    port.onMessage.addListener(function(msg) {
        console.log('new message:: ', msg)

        if (msg.kind === 'all-tabs-request') {
            chrome.tabs.query({}, tabs => {
                port.postMessage({
                    kind: 'all-tabs-response',
                    data: tabs
                });
                console.log('all-tabs-request:: ', tabs)
            });
        }
        if (msg.kind === 'all-tab-groups-request') {
            chrome.tabGroups.query({}, groups => {
                port.postMessage({
                    kind: 'all-tab-groups-response',
                    data: groups
                });
                console.log('all-tab-groups-response:: ', groups)
            });
        }
        if (msg.kind === 'collapse-tab-groups') {
            chrome.tabGroups.update(msg.group, {collapsed: msg.collapse})
        }
        if (msg.kind === 'title-tab-groups') {
            chrome.tabGroups.update(msg.group, {title: msg.title})
        }
        if (msg.kind === 'color-tab-groups') {
            chrome.tabGroups.update(msg.group, {color: msg.color})
        }
        if (msg.kind === 'open-request-existing-tab') {
            chrome.tabs.update(msg.tab, {active: true})
        }
        if (msg.kind === 'pin-tab') {
            chrome.tabs.update(msg.tab, {pinned: true})
        }
        if (msg.kind === 'close-tabs') {
            chrome.tabs.remove(msg.tab)
        }
        if (msg.kind === 'unpin-tab') {
            chrome.tabs.update(msg.tab, {pinned: false})
        }
        if (msg.kind === 'open-request-new-tab') {
            chrome.tabs.create({
                url: msg.url,
                pinned: msg.pinned
            });
        }
    })
})
