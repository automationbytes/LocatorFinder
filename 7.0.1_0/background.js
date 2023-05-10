/**********************************************************************
 @see  https://www.testleaf.com
 @since - 2019
 **********************************************************************/
const manifest = chrome.runtime.getManifest();
//TODO: Enable it before release 
// chrome.runtime.setUninstallURL(uninstallURL, () => { })

//TODO: Enable it before release 
// chrome.runtime.onInstalled.addListener(installedListener);

let checkedState = false;
function toggle() {
    checkedState = !checkedState;
    if (checkedState) {
        chrome.contextMenus.update('flf', { "title": "Axes (Target)", }, () => { })
        chrome.contextMenus.update('flfLevel', { "enabled": false })
        chrome.contextMenus.update('flfStd', { "enabled": false })
    } else {
        chrome.contextMenus.update('flf', { "title": "Axes (Source)", }, () => { })
        chrome.contextMenus.update('flfLevel', { "enabled": true })
        chrome.contextMenus.update('flfStd', { "enabled": true })
    }
}
//***for 3 Level Xpath*** 
// for iteration
let title;
let enable = true;
function toggleLevel(i) {
    if (i === 2) {
        title = "Multi Axes (Mid)"
        enable = false;
    } else if (i === 3) {
        title = "Multi Axes (Target)"
        enable = false;
    } else if (i === 0 || i === 1) {
        title = "Multi Axes (Source)"
        enable = true;
    }
    chrome.contextMenus.update('flfLevel', { "title": `${title}`, }, () => { });
    chrome.contextMenus.update('flf', { "enabled": enable })
    chrome.contextMenus.update('flfStd', { "enabled": enable })
    if (i >= 3) {
        this.i = 0;

    }
};
//***for resetting to default***
function getUndo(info, tab) {
    let msg = { subject: "clearXP" };
    let inspectedId = tab.id;
    let selectedFrameId = info.frameId;
    chrome.tabs.sendMessage(inspectedId, msg, { frameId: selectedFrameId });
}
chrome.contextMenus.create({
    "id": "flfStd",
    "title": "Standard",
    "contexts": ["all"],
    "onclick": getXPath
});
chrome.contextMenus.create({
    "id": "flf",
    "title": "Axes (Source)",
    "contexts": ["all"],
    "onclick": getXPathMultiple
});

//***for 3 Level Xpath***
chrome.contextMenus.create({
    "id": "flfLevel",
    "title": "Multi Axes (Source)",
    "contexts": ["all"],
    "onclick": getXPathMultiLevel
});

//***for settings to default***
chrome.contextMenus.create({
    "id": "flfundo",
    "title": "Undo",
    "contexts": ["all"],
    "onclick": getUndo
});
var i = 1;
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == "flf") {
        toggle();
    }
    if (info.menuItemId == "flfLevel") {
        i++; toggleLevel(i);
    }
    if (info.menuItemId == "flfundo") {
        i = 1;
        toggleLevel(i);
        checkedState = true;
        toggle();
    }
});

function getXPathMultiple(info, tab) {
    let msg = { subject: "AnchorXP" };
    let inspectedId = tab.id;
    let selectedFrameId = info.frameId;
    chrome.tabs.sendMessage(inspectedId, msg, { frameId: selectedFrameId });
}

function getXPathMultiLevel(info, tab) {
    let msg = { subject: "LevelXP" };
    let inspectedId = tab.id;
    let selectedFrameId = info.frameId;
    chrome.tabs.sendMessage(inspectedId, msg, { frameId: selectedFrameId });
}

function getXPath(info, tab) {
    let msg = { subject: "getXPath" };
    let inspectedId = tab.id;
    let selectedFrameId = info.frameId;
    chrome.tabs.sendMessage(inspectedId, msg, { frameId: selectedFrameId });
}

chrome.storage.onChanged.addListener(function (changes, storageName) {
    if (storageName == 'local' && 'total' in changes) {
        if (changes.total.newValue === '+1') {
            try { setbadgeAndColor(changes, "red"); } catch (error) { }
        } else {
            try { setbadgeAndColor(changes, "blue"); } catch (error) { }
        }
    }
})

function setbadgeAndColor(changes, color) {
    chrome.browserAction.setBadgeBackgroundColor({ color: color });
    chrome.browserAction.setBadgeText({ text: changes.total.newValue.toString() });
}
window.src = null;
window.dst = null;
window.proOrFol = null;
window.anchor = false;
window.LevelEnable = false;//***for 3 Level Xpath***
window.type = null;
window.xpath = null;
window.tag = null;
window.hasFrame = null;
window.variableFromBg = null;
window.defaultXPath = null;
var atrributesArray = null;
window.shadowRoot = false;
var webtable = null;
window.cssPath = null;
var angularXP = null;

chrome.runtime.onMessage.addListener(receiver);
function receiver(request, sender, sendResponse) {
    angularXP = request.angXP;
    window.cssPath = request.cssPath;
    webtable = request.webtabledetails;
    window.shadowRoot = request.shadowRoot;
    window.xpath = request.xpathid;
    window.tag = request.tag;
    window.hasFrame = request.hasFrame;
    window.variableFromBg = request.variableFromBg;
    window.type = request.type;
    window.anchor = request.anchor;
    window.LevelEnable = request.LevelEnable; //***for 3 Level Xpath***
    window.src = request.src;
    window.dst = request.dst;
    window.lev1 = request.lev1
    window.lev2 = request.lev2
    window.lev3 = request.lev3
    window.proOrFol = request.proOrFol;
    window.defaultXPath = request.defaultXPath;
    window.atrributesArray = request.atrributesArray;
}
chrome.tabs.onActiveChanged.addListener(function (tabId, selectInfo) {
    chrome.tabs.sendMessage(tabId, {
        subject: "OFF",
    })
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    i = 1;
    toggleLevel(i);
    checkedState = true;
    toggle();
    chrome.tabs.sendMessage(tabId, {
        subject: "OFF",
    })
});
