function handleTable(ele) {
    let orgEle = ele;
    let no_of_tables = document.getElementsByTagName('table').length;
    ele = ele.closest('table');
    ele.setAttribute('ruto', 'rutotable');
    let has = checkIDNameClassHref(ele, !true);
    if (!has) {
        while (!has) {
            ele = ele.parentElement;
            has = checkIDNameClassHref(ele, !true);
        }
    }
    let tag = ele.tagName.toLowerCase();
    let tableElementFound;
    let count;
    if (ele.hasAttribute('id')) {
        tableElementFound = `//${tag}[@id='${ele.id}']`;
        count = getCountForEachXpath(tableElementFound);
    }
    else if (ele.hasAttribute('class')) {
        let length = ele.classList.length;
        if (length > 1) {
            tableElementFound = `//${tag}[contains(@class,'${ele.classList[0]} ${ele.classList[1]}')]`;
        }
        else {
            tableElementFound = `//${tag}[@class='${ele.className}']`;
        }
        count = getCountForEachXpath(tableElementFound);
    }
    else if (ele.hasAttribute('name')) {
        tableElementFound = `//${tag}[@name='${ele.name}' ]`;
        count = getCountForEachXpath(tableElementFound);
    }
    let tablePath;
    let ev = evaluateXpath(tableElementFound);
    if (ev.singleNodeValue != null) {
        if (ev.singleNodeValue.hasAttribute('ruto')) {
            tablePath = tableElementFound;
        }
        else {
            tablePath = getTableXpath(tableElementFound);
        }
    }
    ele = evaluateXpath(tablePath).singleNodeValue;
    ele.removeAttribute('ruto', 'rutotable');
    let data = getLongTableRow(orgEle, tablePath);
    let details = {
        tableLocator: tablePath,
        totalTables: no_of_tables,
        tableData: data
    };
    webTableDetails = details;
    function getTableXpath(locator) {
        let tablePath = `${locator}//table`;
        let evaluated = evaluateXpath(tablePath);
        if (evaluated.singleNodeValue != null) {
            if (evaluated.singleNodeValue.hasAttribute('ruto'))
                return tablePath;
            else if (getCountForEachXpath(tablePath) > 1) {
                return addTableIndexToXpath(tablePath);
            }
        }
        else {
            tablePath = `${locator}/following::table`;
            let evaluated = evaluateXpath(tablePath);
            if (evaluated.singleNodeValue != null) {
                if (evaluated.singleNodeValue.hasAttribute('ruto'))
                    return tablePath;
                else if (getCountForEachXpath(tablePath) > 1) {
                    return addTableIndexToXpath(tablePath);
                }
            }
        }
        return null;
    }
}
function getLongTableRow(ele, tablePath) {
    var rowsPath = [];
    while (ele.nodeType === 1) {
        let tag = ele.tagName.toLowerCase();
        if (tag == 'table') {
            rowsPath.unshift(tablePath);
            break;
        } else {
            let prevSib = ele, position = 1;
            while (prevSib = prevSib.previousElementSibling) {
                if (prevSib.tagName.toLowerCase() == tag) position++;
            }
            tag += `[${position}]`
        }
        rowsPath.unshift(tag);
        ele = ele.parentNode
    }
    return rowsPath.join("/");
}
function addTableIndexToXpath(allXpathAttr) {
    try {
        var index = 0;
        let doc = document.evaluate(allXpathAttr, document, null, XPathResult.ANY_TYPE, null);
        var next = doc.iterateNext();
        try {
            while (next) {
                index++;
                if ((next.attributes.ruto) != undefined) { throw 'break' }
                next = doc.iterateNext();
            }
        }
        catch (error) { }
        let indexedXpath = `(${allXpathAttr})[${index}]`;
        let c = getCountForEachXpath(indexedXpath)
        if (c > 0) { return indexedXpath; } else return null;
    } catch (error) { }
}
