function stopRecord() {
    document.removeEventListener("mouseover", mouseOver, true);
    document.removeEventListener("mouseout", mouseOut, true);
    let values = {
        date: Date.now().toString(),
        xpath: recordArray,
        xpathPOM: recordArrayPOM,
        title: document.title,
        URL: document.URL
    }
    chrome.storage.local.set({ "downloadData": values })
}
function startRecording() {
    searchXPathArray = [];
    document.addEventListener("mouseover", mouseOver, true);
    document.addEventListener("mouseout", mouseOut, true);
    document.addEventListener("click", doRecord, true);
}
function doRecord(event) {
    if (isRecordEnabled) {
        event.stopPropagation();
        event.preventDefault();
        clickedElement = event.target;
        rutoX.parseSelectedDOM();
        searchAll();
        try {
            searchXPathArray = [];
            atrributesArray = [];
            webTableDetails = null;
        } catch (error) {
            searchXPathArray = [];
            atrributesArray = [];
            webTableDetails = null;
        }
    }
}
// version 3.1.0 id = ilcoelkkcokgeeijnopjnolmmighnppp
/***
 * @see  https://www.testleaf.com
 * @since - 2019 - Feb
 */