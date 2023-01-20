
// chrome.history.getVisits({url: "https://lomni.io/"},(res) => {
//     console.log("visits", res)
// })

chrome.runtime.onConnectExternal.addListener(function(port) {
    console.log("onConnectExternal", port)

    chrome.commands.onCommand.addListener((command) => {
        if (command === 'moveFrameUp'){
            chrome.tabs.query({active: true, lastFocusedWindow: true},  tabs => {
                chrome.tabs.move(tabs[0].id, {windowId: tabs[0].windowId, index: tabs[0].index-1})
            })
        }
        if (command === 'moveFrameDown'){
            chrome.tabs.query({active: true, lastFocusedWindow: true},  tabs => {
                chrome.tabs.move(tabs[0].id, {windowId: tabs[0].windowId, index: tabs[0].index+1})
            })
        }
        if (command === 'moveUp'){
            chrome.tabs.query({active: true, lastFocusedWindow: true},  activeTabs => {
                if (activeTabs.length > 0 && activeTabs[0].index > 0){
                    chrome.tabs.query({index: activeTabs[0].index-1, lastFocusedWindow: true},  previewsTab => {
                        if (previewsTab.length > 0){
                            chrome.tabs.update(previewsTab[0].id, {active: true})
                        }
                    })
                }
            })
        }
        if (command === 'moveDown'){
            chrome.tabs.query({active: true, lastFocusedWindow: true},  activeTabs => {
                if (activeTabs.length > 0){
                    chrome.tabs.query({index: activeTabs[0].index+1, lastFocusedWindow: true},  nextTab => {
                        if (nextTab.length > 0){
                            chrome.tabs.update(nextTab[0].id, {active: true})
                        }
                    })
                }
            })
        }
    });

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
        if (msg.kind === 'move-tab') {
            chrome.tabs.update(msg.tab, {pinned: false}, () => {
                if (msg.groupId === -1){
                    chrome.tabs.ungroup(msg.tab)
                }else{
                    chrome.tabs.group({tabIds: msg.tab, groupId: msg.groupId})
                }
                chrome.tabs.move(msg.tab, {windowId: msg.windowId, index: msg.index})
            })
        }
        if (msg.kind === 'group-tabs') {
            chrome.tabs.group({tabIds: msg.tabs, groupId: msg.groupId})
        }
        if (msg.kind === 'ungroup-tabs') {
            chrome.tabs.ungroup(msg.tabs)
        }
        if (msg.kind === 'unpin-tab') {
            chrome.tabs.update(msg.tab, {pinned: false})
        }
        if (msg.kind === 'open-and-update') {
            chrome.tabs.create({url: msg.url, windowId: msg.windowId, active: msg.active, index: msg.index}, tab => {
                if (msg.groupId > -1){
                    chrome.tabs.group({tabIds: tab.id, groupId: msg.groupId})
                }
            });
        }
        if (msg.kind === 'open-request-new-tab') {
            chrome.tabs.create({url: msg.url, pinned: msg.pinned, active: msg.active});
        }
    })
})
