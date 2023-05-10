"use strict";

var clickedElement = null;
var index = null;
function getCurrentDocument() {
    return window.document;
}
var rutoX = rutoX || {};
var enablegcx = false;
var isRecordEnabled = false;
// add xpath on context menu click
rutoX.init = function () {
    document.addEventListener("mousedown", function (event) {
        clickedElement = event.target;
    }, true);
}

document.addEventListener("click", clickTogetXpath, true);
function clickTogetXpath(event) {
    if (enablegcx) {
        event.stopPropagation();
        event.preventDefault();
        clickedElement = event.target;
        rutoX.parseSelectedDOM();
        try {
            if (xpathArray != undefined) {
                let domInfo = {
                    cssPath: cssPathArray,
                    xpathid: xpathArray.sort(),
                    tag: tag,
                    type: type,
                    hasFrame: hasFrame,
                    variableFromBg: variableFromBg,
                    anchor: false,
                    LevelEnable: false, //***  for 3 Level Xpath***
                    atrributesArray: atrributesArray,
                    webtabledetails: webTableDetails
                };
                if (_doc == document) {
                    chrome.runtime.sendMessage(domInfo);
                }
                atrributesArray = [];
                webTableDetails = null;
            }
        } catch (error) { }
    }
}

rutoX.parseSelectedDOM = function () {
    if (clickedElement != null) {
        try {
            rutoX.clearHighlights()
        } catch (error) { }
        try {
            maxIndex = tempMaxIndex != null ? tempMaxIndex : 3;
            rutoX.parseDom(clickedElement, 0);
        } catch (error) {
            if (error.message === 'shadow dom not yet supported')
                xpathArray = undefined
            AxesUnique = undefined
        }
        rutoX.highlightSelectedDOM()
        setTimeout(() => {
            rutoX.clearHighlights()
        }, 100);
    }
}
let srcTgtArray = []
rutoX.parseAnchorXP = function () {
    if (clickedElement != null) {
        try {
            rutoX.clearHighlights1()
        } catch (error) { }
        try {
            maxIndex = tempMaxIndex != null ? tempMaxIndex : 3;
            rutoX.parseDom(clickedElement, 1);

        } catch (error) { }
        setTimeout(() => {
            rutoX.clearHighlights2();
        }, 100);
    }
}

//***  for 3 Level Xpath***
rutoX.parseLevelXP = function () {
    if (clickedElement != null) {
        try {
            rutoX.clearHighlights1();
            rutoX.clearHighlights2();
        } catch (error) { }
        try {
            maxIndex = tempMaxIndex != null ? tempMaxIndex : 3;
            rutoX.parseDom(clickedElement, 2);
        } catch (error) { }
        setTimeout(() => {
            rutoX.clearHighlights();
        }, 100);
    }
}
rutoX.highlightSelectedDOM = function () {
    clickedElement.className += ' chromexPathFinder';
}

rutoX.clearHighlights = function () {
    let els = document.getElementsByClassName('chromexPathFinder');
    while (els.length) {
        els[0].className = els[0].className.replace(' chromexPathFinder', '');
    }
};
rutoX.clearHighlights1 = () => {
    let els = document.getElementsByClassName('chromexPathFinder1');
    while (els.length) {
        els[0].className = els[0].className.replace(' chromexPathFinder1', '');
    }
};
rutoX.clearHighlights2 = () => {
    let els = document.getElementsByClassName('chromexPathFinder2');
    while (els.length) {
        els[0].className = els[0].className.replace(' chromexPathFinder2', '');
    }
};

getCurrentDocument().addEventListener('DOMContentLoaded', function () {
    rutoX.init();
    if (enablegcx) {
        document.addEventListener("mouseover", mouseOver, true);
        document.addEventListener("mouseout", mouseOut, true)
    }
    if (isRecordEnabled) {
        document.addEventListener("mouseover", mouseOver, true);
        document.addEventListener("mouseout", mouseOut, true)
    }
});

function mouseOver(e) {
    let t = e.target;
    t.style.outlineWidth = '2px';
    t.style.outlineStyle = 'ridge';
    t.style.outlineColor = 'orangered';
}
function mouseOut(e) {
    let t = e.target;
    t.style.outlineWidth = '';
    t.style.outlineStyle = '';
    t.style.outlineColor = '';
}
function addRemoveOutlineCustomeXpath(next) {
    next.setAttribute('style', 'outline: green solid;');
    setTimeout(() => {
        next.removeAttribute('style', 'outline: green solid;');
    }, 100);
}
chrome.runtime.onMessage.addListener(senderM);
function senderM(request, sender, sendResponse) {
    switch (request.subject) {
        case 'OFF':
            enablegcx = false;
            setStorage
            document.removeEventListener("mouseover", mouseOver, true);
            document.removeEventListener("mouseout", mouseOut, true);
            chrome.storage.local.set({
                'gcx': 'false', 'isRecord': 'false', 'total': 0
            });
            isRecordEnabled = false;
            stopRecord();
            let domInfo = {
                xpathid: undefined,
            }
            chrome.runtime.sendMessage(domInfo);
            break;
        case 'validateAnchorDetails':
            if (_doc == document) {
                let value;
                let ex;
                let PreOrFol = request.PreOrFol;
                let one = request.source;
                let sec = request.middle;
                let third = request.target;
                if (third != null) {
                    value = `${one}${PreOrFol}${sec}${PreOrFol}${third}`
                } else {
                    value = `${one}${PreOrFol}${sec}`
                }
                let snapShot = document.evaluate(value, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                let count = snapShot.snapshotLength;
                if (count == 0 || count == undefined) {
                    chrome.storage.local.set({
                        "anchorEvalXPath": 'Sorry! Please try with different XPath combination'
                    });
                } else if (count == 1) {
                    chrome.storage.local.set({
                        "anchorEvalXPath": value
                    });
                    addRemoveOutlineCustomeXpath(evaluateXpath(value).singleNodeValue);
                } else if (count > 1) {

                    if (third != null) {
                        value = addIndexToAxesXpath(`${one}${PreOrFol}${sec}`, PreOrFol);
                        ex = addIndexToAxesXpath(`${value}${PreOrFol}${third}`, PreOrFol);
                    } else {
                        ex = addIndexToAxesXpath(value, PreOrFol);
                    }

                    if (ex != null) {
                        chrome.storage.local.set({
                            "anchorEvalXPath": ex
                        });
                        addRemoveOutlineCustomeXpath(evaluateXpath(ex).singleNodeValue);
                    } else
                        chrome.storage.local.set({
                            "anchorEvalXPath": 'Sorry! Please try with different XPath combination'
                        });
                }
            }
            break;
        case "AnchorXP":
            rutoX.parseAnchorXP();
            atrributesArray = [];
            webTableDetails = null;
            return true;
        case "LevelXP": //***  for 3 Level Xpath***
            rutoX.parseLevelXP();
            atrributesArray = [];
            webTableDetails = null;
            return true;
        case "changeXpSty":
            enablegcx = true;
            document.addEventListener("mouseover", mouseOver, true);
            document.addEventListener("mouseout", mouseOut, true);
            break;
        case "cancelChangeXpSty":
            enablegcx = !true;
            document.removeEventListener("mouseover", mouseOver, true);
            document.removeEventListener("mouseout", mouseOut, true);
            return true;
        case "getXPath":
            rutoX.parseSelectedDOM();
            try {
                if (xpathArray != undefined) {
                    let domInfo = {
                        angXP: angularArray,
                        cssPath: cssPathArray,
                        webtabledetails: webTableDetails,
                        xpathid: xpathArray.sort(),
                        tag: tag,
                        type: type,
                        hasFrame: hasFrame,
                        variableFromBg: variableFromBg,
                        anchor: false,
                        LevelEnable: false,  //***  for 3 Level Xpath***
                        atrributesArray: atrributesArray
                    };
                    if (_doc == document) {
                        chrome.runtime.sendMessage(domInfo);
                    }

                    atrributesArray = [];
                    webTableDetails = null;
                }
            } catch (error) { }
            return true;
        case 'clearXP':
            try {
                clearXpath();
            } catch (error) { }
            break;
        case 'startRecord':
            try {
                let domInfo = {
                    xpathid: undefined,
                }
                chrome.runtime.sendMessage(domInfo);
                isRecordEnabled = true;
                recordArray = [];
                recordArrayPOM = []
                startRecording();
            } catch (error) { }
            break;
        case 'stopRecord':
            try {
                isRecordEnabled = false;
                stopRecord();
            } catch (error) { }
            break;
        default:
            return true;
    }
}
function clearXpath() {
    rutoX.clearHighlights();
    rutoX.clearHighlights1();
    rutoX.clearHighlights2();
    webTableDetails = null;
    tagArrHolder = [];
    AxesArray = [];
    multiAxesArray = [];
    dupArray.length = 0
    sortArray.length = 0;
    setStorage(0)
}
let maxIndex = 3;
let maxCount = 0;
let tempMaxIndex = 3;
let maxId = 3;
chrome.storage.local.get(['index', 'idNum'], function (data) {
    if (data.index != undefined) {
        tempMaxIndex = data.index;
    }
    if (data.idNum != undefined) {
        maxId = data.idNum;
    }
});
let setPreOrFol = null;
let variableName = null;
let methodName = null;
let hasFrame = null;
let variableFromBg = null;
let type = null;
let tag = null;
let tagArrHolder = [];
let AxesArray = [];
let multiAxesArray = [];
let dupArray = [];
let unique_Axes = [];
let sortArray = [];
let xpathArray;
let AxesUnique;
let cssPathArray = null;
let mulXpathArray = [];
let rutoInc = null
let ruto = "[@rutoxpath='ruto']";
let rutoMid = "[@rutoxpathmid='ruto']";
let _doc = '';
let atrributesArray = [];
let webTableDetails = null;
let angularArray = null;
let tagName;
rutoX.buildXpath = (element, boolAnchor) => {
    if (element.shadowRoot != null) {
        setStorage('-1');
        chrome.runtime.sendMessage({
            shadowRoot: true,
            anchor: undefined,
            LevelEnable: undefined //***  for 3 Level Xpath***
        });
        throw new TypeError('shadow dom not yet supported')
    }
    let removeRuto = `//*${ruto}`;
    let re = evaluateXpath(removeRuto)
    if (re.singleNodeValue != null) {
        re.singleNodeValue.removeAttribute('rutoxpath');
    }
    _doc = document;
    element.setAttribute('rutoxpath', 'ruto')
    try {
        let name = getMethodOrVarText(element);
        getVariableAndMethodName(name);
        methodName = methodName.length >= 2 && methodName.length < 25 ? methodName : methodName.slice(0, 10);
        chrome.storage.local.set({
            'methodName': methodName
        });
        variableName = variableName.length >= 2 && variableName.length < 25 ? variableName : variableName.slice(0, 10);
        chrome.storage.local.set({
            'variableName': variableName
        });
        variableFromBg = variableName;
    } catch (error) {
        variableFromBg = null;
        chrome.storage.local.set({
            'methodName': null
        });
        chrome.storage.local.set({
            'variableName': null
        });
    }
    xpathArray = [];
    AxesUnique = [];
    if ((element.farthestViewportElement != undefined) || (element.tagName === 'SVG') || (element.tagName === 'svg')) {
        try {
            element = element.farthestViewportElement.parentNode;
        } catch (error) {
            element = element.parentNode
        }
    }
    tagName = element.tagName.toLowerCase();
    tag = tagName;
    if (element.hasAttribute('type')) {
        type = element.type
    }

    if (document.getElementsByTagName(tag).length == 1 && (boolAnchor === 0)) {
        xpathArray.push([10, 'Tag Name is unique', tag])
    } else if (!(boolAnchor === 0)) {
        xpathArray.push([10, 'Tag Name', tag])
    }
    hasFrame = frameElement != null ? frameElement : null;
    let attributeElement = element.attributes;
    let preiousSiblingElement = element.previousElementSibling;
    try {
        xpathAttributes(attributeElement, tagName, element);
    } catch (e) { }

    try {
        xpathFollowingSibling(preiousSiblingElement, tagName);
    } catch (e) { }

    try {
        if (element.innerText != '')
            xpathText(element, tagName, boolAnchor);
    } catch (e) { }
    try {
        if ((tagName === 'input' || tagName === 'textarea')) {
            findLabel(element, tagName)
        }
    } catch (e) { }

    try {
        getParent(element, tagName)
    } catch (error) { }

    try {
        if (element.closest('table')) {
            handleTable(element);
        }
    } catch (error) { }
    try {
        if (xpathArray.length < 3 && boolAnchor === 0)
            xpathArray.push([90, 'Long XPATH', getXPathWithPosition(element)])
    } catch (error) { }
    try {
        cssPathArray = [];
        let css = getLongCssPath(element)
        if (document.querySelectorAll(css).length == 1)
            cssPathArray.push([11, 'CSS', css]);
    } catch (error) { }
    try {
        angularArray = [];
        let angloc = angularLocators(element)
        if (angloc.length > 0 && angloc[0] != undefined) {
            angularArray.push([12, 'Angular buttonText', angloc]);
        }
    } catch (error) { console.error(error) }

}

function FindDomIndexByRutoxpath(element, boolAnchor) {
    let idx = 0;
    var All = document.getElementsByTagName("*");
    Array.prototype.slice.call(All).forEach(function (tags) {
        if (tags.attributes.rutoxpath != undefined) {

            if (boolAnchor === 1) {
                AxesArray.push([element, idx])
            } else {
                multiAxesArray.push([element, idx])
            }
        } else {
            idx++;
        }
    })
}

rutoX.parseDom = (element, boolAnchor) => {

    let removeRuto = `//*${ruto}`;
    let re = evaluateXpath(removeRuto)
    if (re.singleNodeValue != null) {
        re.singleNodeValue.removeAttribute('rutoxpath');
    }
    _doc = document;
    element.setAttribute('rutoxpath', 'ruto')
    switch (boolAnchor) {
        case 0:
            rutoX.buildXpath(element, 0);
            setStorage(xpathArray.length + cssPathArray.length)
            try {
                removeTunaXpath(element);
            } catch (e) { }
            if (isRecordEnabled) {
                xpathArray.sort();
                searchXPathArray.push([variableName, methodName, xpathArray[0][1], xpathArray[0][2]]);
            }
            break;
        case 1:
            FindDomIndexByRutoxpath(element, boolAnchor)
            if (AxesArray.length === 1) {
                let removeRutoMid = `//*${rutoMid}`;
                let reMid = evaluateXpath(removeRutoMid)
                if (reMid.singleNodeValue != null) {
                    reMid.singleNodeValue.removeAttribute('rutoxpathmid');
                }
                clickedElement.className += ' chromexPathFinder1';
                setStorage('+1')
            }
            if (AxesArray.length === 2) {
                let AxesSource = AxesArray[0][1];
                let AxesTarget = AxesArray[1][1];
                if (AxesSource === AxesTarget) {
                    let dom = {
                        anchor: true,
                        LevelEnable: false,
                        defaultXPath: 'Sorry! Axes (Source) and Axes (Target) are Same... Please try with different combination'
                    }
                    if (_doc == document) {
                        chrome.runtime.sendMessage(dom);
                    }
                    AxesArray = [];
                    AxesUnique = [];
                    setStorage('1')
                }
                else {
                    for (const key in AxesArray) {
                        try {
                            rutoX.buildXpath(AxesArray[key][0], 1);
                            tagArrHolder.push(tagName);
                            anchorXPath(xpathArray, tagArrHolder, dupArray, 'anchor', AxesUnique);
                        } catch (error) {
                            AxesArray = [];
                            console.log(error);
                        }
                    }
                }
            }
            break;
        case 2:
            FindDomIndexByRutoxpath(element, boolAnchor)
            if (multiAxesArray.length === 1) {
                clickedElement.className += ' chromexPathFinder1';
                setStorage('+1')
            } else if (multiAxesArray.length === 2) {
                let removeRutoMid = `//*${rutoMid}`;
                let reMid = evaluateXpath(removeRutoMid)
                if (reMid.singleNodeValue != null) {
                    reMid.singleNodeValue.removeAttribute('rutoxpathmid');
                }
                element.setAttribute('rutoxpathmid', 'ruto');
                clickedElement.className += ' chromexPathFinder2';
                setStorage('+1')
            }
            if (multiAxesArray.length === 3) {

                let AxesSource = multiAxesArray[0][1];
                let AxesMid = multiAxesArray[1][1];
                let AxesTarget = multiAxesArray[2][1];
                if (AxesSource === AxesMid) {
                    let dom = {
                        anchor: false,
                        LevelEnable: true,
                        defaultXPath: 'Sorry! Axes (Source) and Axes (Mid) are Same... Please try with different combination'
                    }
                    if (_doc == document) {
                        chrome.runtime.sendMessage(dom);
                    }
                    multiAxesArray = [];
                    AxesUnique = [];
                    setStorage('1')
                } else if (AxesMid === AxesTarget) {
                    let dom = {
                        anchor: false,
                        LevelEnable: true,
                        defaultXPath: 'Sorry! Axes (Mid) and Axes (Target) are Same... Please try with different combination'
                    }
                    if (_doc == document) {
                        chrome.runtime.sendMessage(dom);
                    }
                    multiAxesArray = [];
                    AxesUnique = [];
                    setStorage('1')
                } else if (AxesSource === AxesTarget) {
                    let dom = {
                        anchor: false,
                        LevelEnable: true,
                        defaultXPath: 'Sorry! Axes (Source) and Axes (Target) are Same... Please try with different combination'
                    }
                    if (_doc == document) {
                        chrome.runtime.sendMessage(dom);
                    }
                    multiAxesArray = [];
                    AxesUnique = [];
                    setStorage('1')
                } else {
                    for (const key in multiAxesArray) {
                        rutoX.buildXpath(multiAxesArray[key][0], 2);
                        tagArrHolder.push(tagName);
                        anchorXPath(xpathArray, tagArrHolder, dupArray, 'levels', AxesUnique);
                    }
                }

            }
            break;
    }
}

function extractElefromNode(ele, array) {
    if (ele.hasAttribute('id')) {
        if (document.querySelectorAll(`[id='${ele.id}']`).length == 1)
            return array.unshift(`//${ele.tagName.toLowerCase()}[@id='${ele.id}']`);
    } else if (ele.hasAttribute('name')) {
        if (document.querySelectorAll(`[name='${ele.name}']`).length == 1)
            return array.unshift(`//${ele.tagName.toLowerCase()}[@name='${ele.name}']`);
    }
    return null;
}
function getXPathWithPosition(ele) {
    let rowsPath = [];
    while (ele.nodeType === 1) {
        let tag = ele.tagName.toLowerCase();
        if (extractElefromNode(ele, rowsPath) != null) {
            break;
        } else {
            let prevSib = ele, position = 1;
            while (prevSib = prevSib.previousElementSibling) {
                if (prevSib.tagName.toLowerCase() == tag) position++;
            }
            tag += `[${position}]`
            console.log("tag: " + tag);

        }
        rowsPath.unshift(tag);
        ele = ele.parentNode
    }
    return rowsPath.join('/');
}
function anchorXPath(getsingleXPath, tagArr, dupArray, boolAnchor1, getUniqueXpath) {
    try {
        switch (boolAnchor1) {
            case 'anchor':
                sortArray = getsingleXPath.sort((a, b) => a[0] - b[0]);
                dupArray.push(sortArray);
                let length = dupArray.length

                if (length == 2) {
                    let srcArrayXP = [];
                    let dstArrayXP = [];
                    let firstElement = dupArray[0][1][2];
                    if (firstElement.startsWith("//") || firstElement.startsWith("(")) {
                        firstElement = firstElement;
                    } else {
                        let a = dupArray[0];
                        for (let index = 0; index < a.length; index++) {
                            let c = dupArray[0][index][2];
                            if (c.startsWith('//') || c.startsWith('(')) {
                                firstElement = dupArray[0][index][2];
                                break;
                            }
                        }
                    }
                    let secondElement = `*${ruto}`;
                    if (getCountForEachXpath(`${firstElement}/following-sibling::${secondElement}`) == 1) {
                        setPreOrFol = '/following-sibling::'
                    } else if (getCountForEachXpath(`${firstElement}/preceding-sibling::${secondElement}`) == 1) {
                        setPreOrFol = '/preceding-sibling::'
                    } else if (getCountForEachXpath(`${firstElement}/following::${secondElement}`) == 1) {
                        setPreOrFol = '/following::'
                    } else if (getCountForEachXpath(`${firstElement}/preceding::${secondElement}`) == 1) {
                        setPreOrFol = '/preceding::'
                    } else if (getCountForEachXpath(`${firstElement}/${secondElement}`) == 1) {
                        setPreOrFol = '/'
                    } else if (getCountForEachXpath(`${firstElement}/parent::${secondElement}`) == 1) {
                        setPreOrFol = '/parent::'
                    } else if (getCountForEachXpath(`${firstElement}//${secondElement}`) == 1) {
                        setPreOrFol = '//'
                    } else {
                        setPreOrFol = null;
                    }
                    let sxp = dupArray[0];
                    let dxp = dupArray[1];
                    extractXPathFormArray(sxp, srcArrayXP, tagArr[0], 1);
                    extractXPathFormArray(dxp, dstArrayXP, tagArr[1], 2);
                    let patternError = [];
                    for (const key in srcArrayXP) {
                        for (const keyDst in dstArrayXP) {
                            if (srcArrayXP[key][2] != "Tag") {
                                let srcXpath = `${srcArrayXP[key][1]}${setPreOrFol}${dstArrayXP[keyDst][1]}`;
                                let indexXpath = addIndexToAxesXpath(srcXpath, setPreOrFol);
                                if (indexXpath != null) {
                                    if (!patternError.includes(dstArrayXP[keyDst][1]))
                                        patternError.push(dstArrayXP[keyDst][1]);
                                }
                            }
                        }
                    }
                    //removing the xpath does not match
                    let scrArray = srcArrayXP.filter(item => item[2] !== "Tag")
                        .sort((a, b) => a[0] - b[0]);
                    let dstArray = dstArrayXP.filter(item => patternError.find(itemError => item[1] === itemError && !item[2].includes("Parent")))
                        .sort((a, b) => a[0] - b[0]);
                    let defaultXP = `${scrArray[0][1]}${setPreOrFol}${dstArray[0][1]}`;
                    let defaultCount = getCountForEachXpath(defaultXP);
                    if (defaultCount === null || defaultCount === undefined) {
                        defaultXP = 'Sorry! Please try with different XPath combination';
                    } else if (defaultCount == 1) {
                        defaultXP = defaultXP;
                    } else if (defaultCount > 1) {
                        defaultXP = addIndexToAxesXpath(defaultXP, setPreOrFol);
                        if (defaultXP === null || defaultXP === undefined) {
                            defaultXP = 'Sorry! Please try with different XPath combination';
                        }
                    }
                    let dom = {
                        webtabledetails: webTableDetails,
                        anchor: true,
                        LevelEnable: false, //***bowya for 3 Level Xpath***
                        proOrFol: setPreOrFol,
                        src: scrArray,
                        dst: dstArray,
                        defaultXPath: defaultXP,
                    }
                    clickedElement.className += ' chromexPathFinder2';
                    if (_doc == document) {
                        chrome.runtime.sendMessage(dom);
                    }
                    webTableDetails = null;
                    tagArrHolder = [];
                    AxesArray = [];
                    AxesUnique = [];
                    dupArray.length = 0
                    sortArray.length = 0;
                    setStorage(1)
                }
                break;

            case 'levels':

                sortArray = getsingleXPath.sort((a, b) => a[0] - b[0]);
                dupArray.push(sortArray);
                let levlength = dupArray.length
                if (levlength == 3) {
                    let lev1ArrayXP = [];
                    let lev2ArrayXP = [];
                    let lev3ArrayXP = [];
                    let firstElement = dupArray[0][1][2];
                    if (firstElement.startsWith("//") || firstElement.startsWith("(")) {
                        firstElement = firstElement;
                    } else {
                        let a = dupArray[0];
                        for (let index = 0; index < a.length; index++) {
                            let c = dupArray[0][index][2];
                            if (c.startsWith('//') || c.startsWith('(')) {
                                firstElement = dupArray[0][index][2];
                                break;
                            }
                        }
                    }
                    let secondElement = dupArray[1][0][2];
                    if (secondElement.startsWith("//")) {
                        secondElement = secondElement.substring(2);
                    } else if (secondElement.startsWith("(")) {
                        secondElement = secondElement.substring(3, secondElement.lastIndexOf(')'));
                    } else {
                        let a = dupArray[1];
                        for (let index = 0; index < a.length; index++) {
                            let c = dupArray[1][index][2];
                            if (c.startsWith('//')) {
                                secondElement = dupArray[1][index][2];
                                secondElement = secondElement.substring(2);
                                break;
                            } else if (c.startsWith("(")) {
                                secondElement = dupArray[1][index][2];
                                secondElement = secondElement.substring(3, secondElement.lastIndexOf(')'));
                            }
                        }
                    }
                    let thirdElement = `*${ruto}`
                    if (getCountForEachXpath(`${firstElement}/following-sibling::${secondElement}/following-sibling::${thirdElement}`) == 1) {
                        setPreOrFol = '/following-sibling::'
                    } else if (getCountForEachXpath(`${firstElement}/preceding-sibling::${secondElement}/preceding-sibling::${thirdElement}`) == 1) {
                        setPreOrFol = '/preceding-sibling::'
                    } else if (getCountForEachXpath(`${firstElement}/following::${secondElement}/following::${thirdElement}`) == 1) {
                        setPreOrFol = '/following::'
                    } else if (getCountForEachXpath(`${firstElement}/preceding::${secondElement}/preceding::${thirdElement}`) == 1) {
                        setPreOrFol = '/preceding::'
                    } else if (getCountForEachXpath(`${firstElement}/${secondElement}/${thirdElement}`) == 1) {
                        setPreOrFol = '/'
                    } else if (getCountForEachXpath(`${firstElement}/parent::${secondElement}/parent::${thirdElement}`) == 1) {
                        setPreOrFol = '/parent::'
                    } else if (getCountForEachXpath(`${firstElement}//${secondElement}//${thirdElement}`) == 1) {
                        setPreOrFol = '//'
                    } else {
                        setPreOrFol = null;
                    }
                    let lev1 = dupArray[0];
                    let lev2 = dupArray[1];
                    let lev3 = dupArray[2];

                    extractXPathFormArray(lev1, lev1ArrayXP, tagArr[0], 1);
                    extractXPathFormArray(lev2, lev2ArrayXP, tagArr[1], 2);
                    extractXPathFormArray(lev3, lev3ArrayXP, tagArr[2], 2);
                    let patternTgtError = [];
                    for (const keyLev1 in lev1ArrayXP) {
                        for (const keyLev2 in lev2ArrayXP) {
                            let lev2Xpath = addIndexToAxesXpath(`${lev1ArrayXP[keyLev1][1]}${setPreOrFol}${lev2ArrayXP[keyLev2][1]}`, setPreOrFol);
                            for (const keyLev3 in lev3ArrayXP) {
                                if (lev1ArrayXP[keyLev1][2] != "Tag" || lev2ArrayXP[keyLev2][2] != "Tag") {
                                    let lev3Xpath = `${lev2Xpath}${setPreOrFol}${lev3ArrayXP[keyLev3][1]}`;
                                    let indexXpath = addIndexToAxesXpath(lev3Xpath, setPreOrFol);
                                    if (indexXpath != null) {
                                        if (!patternTgtError.includes(lev3ArrayXP[keyLev3][1]))
                                            patternTgtError.push(lev3ArrayXP[keyLev3][1]);
                                    }
                                }
                            }
                        }
                    }
                    let lev1SrcArray = lev1ArrayXP.filter(item => item[2] !== "Tag")
                        .sort((a, b) => a[0] - b[0]);
                    let lev2MidArray = lev2ArrayXP.filter(item => !item[2].includes("Parent") && item[2] !== "Tag")
                        .sort((a, b) => a[0] - b[0]);
                    let lev3TgtArray = lev3ArrayXP.filter(item => patternTgtError.find(itemError => item[1] === itemError && !item[2].includes("Parent")))
                        .sort((a, b) => a[0] - b[0]);
                    let defaultXP = `${lev1SrcArray[0][1]}${setPreOrFol}${lev2MidArray[0][1]}${setPreOrFol}${lev3TgtArray[0][1]}`;
                    let defaultCount = getCountForEachXpath(defaultXP);
                    if (defaultCount === null || defaultCount === undefined) {
                        defaultXP = 'Sorry! Please try with different XPath combination';
                    } else if (defaultCount == 1) {
                        defaultXP = defaultXP;
                    } else if (defaultCount > 1) {
                        defaultXP = addIndexToAxesXpath(`${lev1SrcArray[0][1]}${setPreOrFol}${lev2MidArray[0][1]}`, setPreOrFol);
                        defaultXP = addIndexToAxesXpath(`${defaultXP}${setPreOrFol}${lev3TgtArray[0][1]}`, setPreOrFol);
                        if (defaultXP === null || defaultXP === undefined) {
                            defaultXP = 'Sorry! Please try with different XPath combination';
                        }
                    }
                    let dom = {
                        webtabledetails: webTableDetails,
                        anchor: false,
                        LevelEnable: true, //***  for 3 Level Xpath***
                        proOrFol: setPreOrFol,
                        lev1: lev1SrcArray,
                        lev2: lev2MidArray,
                        lev3: lev3TgtArray,
                        defaultXPath: defaultXP,
                    }
                    clickedElement.className += ' chromexPathFinder';
                    if (_doc == document) {
                        chrome.runtime.sendMessage(dom);
                    }
                    webTableDetails = null;
                    tagArrHolder = [];
                    multiAxesArray = [];
                    AxesUnique = [];
                    dupArray.length = 0
                    sortArray.length = 0;
                    setStorage(1)

                    break;
                }
        }

    } catch (error) {
        console.log(error);
        clearXpath();
    }

    function extractXPathFormArray(sxp, anchorArr, tag, arrayIndex) {
        for (const key in sxp) {
            let xpathNumber = sxp[key][0];
            let xpathValue = sxp[key][1];
            let xpathData = sxp[key][2];
            switch (xpathNumber) {
                case 1:
                    pushXPath(xpathData, anchorArr, tag, 'id', 0, xpathValue, arrayIndex);
                    break;
                case 2:
                    pushXPath(xpathData, anchorArr, tag, 'name', 1, xpathValue, arrayIndex);
                    break;
                case 3:
                    pushXPath(xpathData, anchorArr, tag, 'class', 2, xpathValue, arrayIndex);
                    break;
                case 0:
                    if (xpathData.startsWith('//') || xpathData.startsWith('(')) {
                        if (xpathData.startsWith('//')) {
                            if (arrayIndex === 2) {
                                xpathData = xpathData.substring(2, xpathData.length);
                            }
                            if (xpathValue.includes("Text based XPath")) {
                                anchorArr.push([-2, xpathData, `${xpathValue.split(' ')[0]} ${xpathValue.split(' ')[1]}`]);
                            } else {
                                anchorArr.push([3, xpathData, `${xpathValue.split(' ')[0]} ${xpathValue.split(' ')[1]}`]);
                            }
                        } else if (xpathData.startsWith('(//')) {
                            if (arrayIndex === 2) {
                                xpathData = xpathData.substring(3, xpathData.lastIndexOf(')'));
                            }
                            if (xpathValue.includes("Text based XPath")) {
                                anchorArr.push([-2, xpathData, `${xpathValue.split(' ')[0]} ${xpathValue.split(' ')[1]}`]);
                            } else {
                                anchorArr.push([3, xpathData, `${xpathValue.split(' ')[0]} ${xpathValue.split(' ')[1]}`]);
                            }
                        }
                    } else {
                        if (arrayIndex === 2) {
                            let temp = `${tag}[text()[normalize-space()='${xpathData}']]`;
                            anchorArr.push([-1, temp, `${xpathValue.split(' ')[0]} ${xpathValue.split(' ')[1]}`]);
                        } else if (arrayIndex === 1) {
                            let temp = `//${tag}[text()[normalize-space()='${xpathData}']]`;
                            anchorArr.push([-1, temp, `${xpathValue.split(' ')[0]} ${xpathValue.split(' ')[1]}`]);
                        }
                    }
                    break;
                case 10:
                    if (arrayIndex === 2) {
                        anchorArr.push([-3, tag, `${xpathValue.split(' ')[0]}`]);
                    } else {
                        anchorArr.push([-3, `//${tag}`, `${xpathValue.split(' ')[0]}`]);
                    }
                    break;
                default:
                    if (xpathData.startsWith('//') || xpathData.startsWith('(')) {
                        if (xpathData.startsWith('//')) {
                            if (arrayIndex === 2) {
                                xpathData = xpathData.substring(2, xpathData.length);
                            }
                            if (xpathValue.includes("Text based XPath")) {
                                anchorArr.push([-2, xpathData, `${xpathValue.split(' ')[0]} (${xpathValue.split(' ')[2]})`]);
                            } else {
                                anchorArr.push([3, xpathData, `${xpathValue.split(' ')[0]} (${xpathValue.split(' ')[2]})`]);
                            }
                        } else if (xpathData.startsWith('(//')) {
                            if (arrayIndex === 2) {
                                xpathData = xpathData.substring(3, xpathData.lastIndexOf(')'));
                            }
                            if (xpathValue.includes("Text based XPath")) {
                                anchorArr.push([-2, xpathData, `${xpathValue.split(' ')[0]} (${xpathValue.split(' ')[2]})`]);
                            } else {
                                anchorArr.push([3, xpathData, `${xpathValue.split(' ')[0]} (${xpathValue.split(' ')[2]})`]);
                            }
                        }
                    }
                    break;
            }
        }
    }
    function pushXPath(xpathData, anchorArr, tag, attr, number, xpathValue, arrayIndex) {
        if (xpathData.startsWith('//') || xpathData.startsWith('(')) {
            if (xpathData.startsWith('//')) {
                if (arrayIndex === 2) {
                    xpathData = xpathData.substring(2, xpathData.length);
                }
                anchorArr.push([number, xpathData, xpathValue.split(' ')[0]]);
            } else if (xpathData.startsWith('(//')) {
                if (arrayIndex === 2) {
                    xpathData = xpathData.substring(3, xpathData.lastIndexOf(')'));
                }
                anchorArr.push([number, xpathData, xpathValue.split(' ')[0]]);
            }
        } else {
            if (arrayIndex === 2) {
                let temp = `${tag}[@${attr}='${xpathData}']`;
                anchorArr.push([number, temp, xpathValue.split(' ')[0]]);
            } else {
                let temp = `//${tag}[@${attr}='${xpathData}']`;
                anchorArr.push([number, temp, xpathValue.split(' ')[0]]);
            }
        }
    }
}
function setStorage(c) {
    chrome.storage.local.set({
        'total': c
    });
}
function getParent(element, tagName) {
    let parent = element.parentNode;
    let bo = false;
    bo = checkIDNameClassHref(parent, bo);
    while (bo == false) {
        parent = parent.parentNode;
        bo = checkIDNameClassHref(parent, bo);
    }
    let attributeElement = parent.attributes;
    let tag = parent.tagName.toLowerCase();
    let parentId = null;
    let parentClass = null;
    let parentName = null;
    let others = [];
    Array.prototype.slice.call(attributeElement).forEach(function (item) {
        if (!(filterAttributesFromElement(item))) {
            switch (item.name) {
                case "id":
                    parentId = getParentId(parent, tag)
                    break;
                case "class":
                    parentClass = getParentClassName(parent, tag)
                    break;
                case "name":
                    parentName = getParentName(parent, tag)
                    break;
                default:
                    let temp = item.value;
                    if (temp != '') {
                        others.push([`//${tag}[@${item.name}='${temp}']`, item.name])
                    }
                    break;
            }
        }
    });
    if (parentId != null && parentId != undefined) {
        getParentXp(parentId, tagName, 'id', element);
    }
    if (parentClass != null && parentClass != undefined) {
        getParentXp(parentClass, tagName, 'class', element);
    }
    if (parentName != null && parentName != undefined) {
        getParentXp(parentName, tagName, 'name', element);
    }
    if (others != null && others != undefined) {
        others.forEach(function (other) {
            getParentXp(other[0], tagName, `attribute(${other[1].slice(0, 15)})`, element);
        })
    }
    function getParentXp(parent, tagName, locator, element) {
        let tem = `${parent}//${tagName}[1]`;
        let checkTem = evaluateXpath(tem)
        let c = getCountForEachXpath(tem);
        if (c == 0) {
            return null;
        }
        if (c == 1) {
            try {
                if (checkTem.singleNodeValue.hasAttribute('rutoxpath')) {
                    xpathArray.push([9, `Parent based ${locator} XPath`, tem]);
                } else {
                    tem = `${parent}//${tagName}`;
                    c = getCountForEachXpath(tem);
                    if (c == 0) {
                        return null;
                    }
                    if (c >= 1) {
                        try {
                            let te = addIndexToXpath(tem)
                            checkTem = evaluateXpath(te)
                            if (checkTem.singleNodeValue.attributes.rutoxpath.value === "ruto") {
                                xpathArray.push([9, `Parent based ${locator} XPath`, te]);
                            }
                        } catch (e) { }
                    }
                }
            } catch (e) { }
        } else if (c > 1) {
            tem = `${parent}//${tagName}`;
            let t = addIndexToXpath(tem);
            if (t != undefined && t != null) {
                xpathArray.push([9, `Parent based ${locator} XPath`, t]);
            }
        }
    }
}
function checkIDNameClassHref(parent, bo) {
    Array.prototype.slice.call(parent.attributes).forEach(function (item) {
        if (item.name === 'id' || item.name === 'class' || item.name === 'name')
            bo = true;
    });
    return bo;
}
function xpathAttributes(attributeElement, tagName, element) {
    addAllXpathAttributesBbased(attributeElement, tagName, element);
}
function xpathFollowingSibling(preiousSiblingElement, tagName) {
    if (preiousSiblingElement != null || preiousSiblingElement != undefined) {
        addPreviousSibling(preiousSiblingElement, tagName);
    }
}
function removeTunaXpath(element) {
    element.removeAttribute('rutoxpath', 'ruto');
}
function xpathText(element, tagName, boolAnchor) {
    let textBasedXpathEle = getTextBasedXpath(element, tagName, boolAnchor);
    if (!((textBasedXpathEle === null) || (textBasedXpathEle === undefined))) {
        xpathArray.push([6, 'Text based XPath', textBasedXpathEle]);
    }
}
function findLabel(element, tagName) {
    let label, span = undefined;
    let ele = `//*[@rutoxpath='ruto']`;
    try {
        label = getLabelTxet(ele, tagName)
    } catch (error) { }
    try {
        span = getSpanText(ele, tagName)
    } catch (error) { }
    try {
        if (label === undefined && span === undefined) {
            let xp = getParentText(element, tagName)
            let temp = xp;
            xp = evaluateXpath(xp);
            if (xp != null && xp != undefined && ((xp.singleNodeValue.attributes.rutoxpath) != undefined)) {
                xpathArray.push([6, 'Text based following XPath', temp]);
            } else {
                temp = addIndexToXpath(temp)
                if (temp != null) {
                    xpathArray.push([6, 'Text based following XPath', temp]);
                }
            }
        }
    } catch (error) { }
}
function getParentText(element, tagName) {
    let ep = element.parentNode.parentNode;
    let child = ep.children;
    let tagN = null;
    let setBool = false;
    for (let i = 0; i < child.length; i++) {
        let innerChildLen = child[i].children.length;
        for (let i = 0; i < innerChildLen; i++) {
            if (child[i].children[i].textContent.length > 1) {
                ep = child[i].children[i];
                tagN = ep.tagName;
                setBool = true;
                break;
            }
        }
        if (setBool)
            break;
    }
    let text = getTextBasedXpath(ep, tagN.toLowerCase())
    let temp = `${text}/following::${tagName}`;
    let count = getCountForEachXpath(temp);
    if (count == 1) {
        let xp = `${text}/following::${tagName}[1]`;
        return xp;
    } else if (count > 1) {
        let xp = `${text}/following::${tagName}`;
        xp = addIndexToXpath(xp)
        return xp;
    } else
        return null;
}
function getLabelTxet(ele, tagName) {
    let labelNode = `${ele}/preceding::label[1]`;
    let checkLabelType = evaluateXpath(labelNode);
    try {
        if (typeof (checkLabelType.singleNodeValue.textContent) === 'string') {
            return getLabel(labelNode, tagName);
        } else {
            throw 'no label preceding';
        }
    } catch (error) { }
}
function getSpanText(ele, tagName) {
    let spanNode = `${ele}/preceding::span[1]`;
    let checkSpanType = evaluateXpath(spanNode);
    try {
        if (typeof (checkSpanType.singleNodeValue.textContent) === 'string') {
            return getLabel(spanNode, tagName);
        } else {
            throw 'no span text'
        }
    } catch (error) { }
}
function getLabel(node, tagName) {
    let c = getCountForEachXpath(node);
    if (c > 0) {
        let label = evaluateXpath(node);
        let newEle = label.singleNodeValue;
        let labelTag = newEle.tagName.toLowerCase();
        let labelText = getTextBasedXpath(newEle, labelTag);
        let newLabelXpath = labelText + '/' + 'following::' + tagName;
        if (getCountForEachXpath(newLabelXpath) == 1) {
            let newLabel = evaluateXpath(newLabelXpath);
            if (newLabel != null && newLabel != undefined && ((newLabel.singleNodeValue.attributes.rutoxpath) != undefined)) {
                xpathArray.push([6, 'Text based following XPath', newLabelXpath]);
                return newLabelXpath;
            }
        } else {
            let labelTextWithIndex = addIndexToXpath(newLabelXpath)
            let newLabel = evaluateXpath(labelTextWithIndex);
            if (!((newLabel === null) || (newLabel === undefined) || ((newLabel.singleNodeValue.attributes.rutoxpath) === undefined))) {
                xpathArray.push([6, 'Text based following XPath', labelTextWithIndex]);
                return labelTextWithIndex;
            }
        }
    }
}
function addPreviousSibling(preSib, tagName) {
    try {
        let classHasSpace = false;
        let temp;
        let previousSiblingTagName = preSib.tagName.toLowerCase();
        Array.prototype.slice.call(preSib.attributes).forEach(function (item) {
            if (!(filterAttributesFromElement(item))) {
                let tempvalue = null;
                switch (item.name) {
                    case 'id':
                        if (preSib.hasAttribute('id')) {
                            let id = preSib.id;
                            let re = new RegExp('\\d{' + maxId + ',}', '\g');
                            let matches = re.test(id);
                            if ((id != null) && (id.length > 0) && matches == false) {
                                tempvalue = id;
                            }
                        }
                        break;
                    case 'class':
                        if (preSib.hasAttribute('class')) {
                            tempvalue = preSib.className;
                            let splClass = tempvalue.trim().split(" ");
                            if (splClass.length > 2) {
                                tempvalue = `contains(@class,'${splClass[0]} ${splClass[1]}')`;
                                classHasSpace = true;
                            }
                        }
                        break;
                    case 'name':
                        if (preSib.hasAttribute('name')) {
                            tempvalue = preSib.name;
                        }
                        break;
                    default:
                        tempvalue = item.value;
                }
                if (tempvalue == '') {
                    tempvalue = null;
                }
                if (classHasSpace) {
                    temp = `//${previousSiblingTagName}[${tempvalue}]/following-sibling::${tagName}[1]`
                    if (temp.startsWith('//')) {
                        if (getCountForEachXpath(temp) == 1 && evaluateXpath(temp).singleNodeValue.attributes.rutoxpath != undefined) {
                            xpathArray.push([8, `Following-sibling based ${(item.name).slice(0, 15)} XPath`, temp]);
                        } else {
                            let t = addIndexToXpath(`//${previousSiblingTagName}[${tempvalue}]/following-sibling::${tagName}`)
                            if (t != undefined) {
                                xpathArray.push([8, `Following-sibling based ${(item.name).slice(0, 15)} XPath`, t])
                            } else
                                temp = null;
                        }
                    }

                } else if (tempvalue != null) {
                    temp = `//${previousSiblingTagName}[@${item.name}='${tempvalue}']/following-sibling::${tagName}[1]`
                    if (temp.startsWith('//')) {
                        if (getCountForEachXpath(temp) == 1 && evaluateXpath(temp).singleNodeValue.attributes.rutoxpath != undefined) {
                            xpathArray.push([8, `Following-sibling based ${(item.name).slice(0, 15)} XPath`, temp]);
                        } else {
                            let t = addIndexToXpath(`//${previousSiblingTagName}[@${item.name}='${tempvalue}']/following-sibling::${tagName}`)
                            if (t != undefined) {
                                xpathArray.push([8, `Following-sibling based ${(item.name).slice(0, 15)} XPath`, t])
                            } else
                                temp = null;
                        }
                    }
                }
            }
        });
        if (temp == null || (preSib.innerText.length > 1)) {
            let temp1;
            let labelText;
            let tag;
            let bo = false;
            let child = preSib.parentNode.children;
            for (let i in child) {
                let text = child[i].textContent;
                if (text != '') {
                    labelText = text;
                    tag = child[i].tagName.toLowerCase()
                    break;
                }
            }
            if (labelText.match(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g)) {
                labelText = labelText.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, " ")
                bo = true;
            }
            if (bo && labelText.trim().length > 1) {
                temp1 = `//${tag}[text()[normalize-space()='${labelText.trim()}']]/following-sibling::${tagName}[1]`;
            } else {
                temp1 = `//${tag}[text()='${labelText}']/following-sibling::${tagName}[1]`;
            }
            let c = getCountForEachXpath(temp1)
            temp1 = `//${tag}[text()='${labelText}']/following-sibling::${tagName}`;
            if (c == 0) {
                return null
            }
            if (c == 1 && evaluateXpath(temp1).singleNodeValue.attributes.rutoxpath != undefined) {
                xpathArray.push([8, 'Following-sibling based Text XPath', temp1])
            } else if ((c != undefined) || (c != null)) {
                xp = addIndexToXpath(temp1)
                if (xp != undefined) {
                    xpathArray.push([8, 'Following-sibling based Text XPath', xp])
                }
            }
        }
    } catch (error) { }
}
function addAllXpathAttributesBbased(attribute, tagName, element) {
    Array.prototype.slice.call(attribute).forEach(function (item) {
        // Filter attribute not to shown in xpath
        atrributesArray.push(item.name);
        if (!(filterAttributesFromElement(item))) {
            // Pushing xpath to arrays
            switch (item.name) {
                case 'id':
                    let id = getIdBasedXpath(element, tagName)
                    if (id != null) {
                        xpathArray.push([1, 'Id is unique:', id])
                    }
                    ; break;
                case 'class':
                    let className = getClassBasedXpath(element, tagName)
                    if (className != null) {
                        xpathArray.push([3, 'Class based XPath', className])
                    }
                    break;
                case 'name':
                    let name = getNameBasedXpath(element, tagName)
                    if (name != null) {
                        xpathArray.push([2, 'Name based XPath', name])
                    }
                    break;
                default:
                    let temp = item.value;
                    let allXpathAttr = null;
                    if (temp != '') {
                        allXpathAttr = `//${tagName}[@${item.name}='${temp}']`
                    }
                    if (getCountForEachXpath(allXpathAttr) == 1) {
                        xpathArray.push([4, `Attribute based ${(item.name).slice(0, 15)} XPath`, allXpathAttr]);
                    } else {
                        let temp = addIndexToXpath(allXpathAttr);
                        if (temp != undefined) {
                            xpathArray.push([4, `Attribute based ${(item.name).slice(0, 15)} XPath`, temp]);
                        }
                    }
                    break;
            }
        }
    });

}
function filterAttributesFromElement(item) {
    return (item.name === 'rutoxpathmid') || (item.name === 'rutoxpath') || (item.name === 'jsname') || (item.name === 'jsmodel') || (item.name === 'jsdata') || (item.name === 'jscontroller') || (item.name === 'face') || (item.name.includes('pattern')) || (item.name.includes('length')) || (item.name === 'border') || (item.name === 'formnovalidate') || (item.name === 'required-field') || (item.name === 'ng-click') || (item.name === 'tabindex') || (item.name === 'required') || (item.name === 'strtindx') || ((item.name === 'title') && (item.value === '')) || (item.name === 'autofocus') || (item.name === 'tabindex') || ((item.name === 'type') && (item.value === 'text')) || (item.name === 'ac_columns') || // (item.name.startsWith('d')) ||
        (item.name === 'ac_order_by') || (item.name.startsWith('aria-')) || (item.name === 'href' && !(item.value.length <= 50)) || (item.name === 'aria-autocomplete') || (item.name === 'autocapitalize') || (item.name === 'jsaction') || (item.name === 'autocorrect') || (item.name === 'aria-haspopup') || (item.name === 'style') || (item.name === 'size') || (item.name === 'height') || (item.name === 'width') || (item.name.startsWith('on')) || (item.name === 'autocomplete') || (item.name === 'value' && item.value.length <= 2) || (item.name === 'ng-model-options') || (item.name === 'ng-model-update-on-enter') || (item.name === 'magellan-navigation-filter') || (item.name === 'ng-blur') || (item.name === 'ng-focus') || (item.name === 'ng-trim') || (item.name === 'spellcheck') || (item.name === 'target') || (item.name === 'rel') || (item.name === 'maxlength');
}
function addIndexToXpath(allXpathAttr) {
    try {
        let indexedXpath;
        let index = 0;
        let doc = document.evaluate(allXpathAttr, document, null, XPathResult.ANY_TYPE, null);
        let next = doc.iterateNext();
        try {
            while (next && index <= maxIndex) {
                index++;
                if ((next.attributes.rutoxpath) != undefined) {
                    throw 'break';
                }
                next = doc.iterateNext();
            }
        } catch (error) { }
        if (index > 1) {
            indexedXpath = `(${allXpathAttr})[${index}]`;
        } else {
            indexedXpath = allXpathAttr;
        }
        if (index <= maxIndex) {
            let c = getCountForEachXpath(indexedXpath)
            if (c > 0) {
                return indexedXpath;
            }
        } else
            return null;
    } catch (error) { }
}

function addIndexToAxesXpath(allXpathAttr, locator, srcXpathAttr) {
    try {
        let index = 0;
        let doc = document.evaluate(allXpathAttr, srcXpathAttr || document, null, XPathResult.ANY_TYPE, null);
        let next = doc.iterateNext();
        let indexedXpath;
        try {
            while (next && index <= maxIndex) {
                index++;
                if ((next.attributes.rutoxpath) != undefined || (next.attributes.rutoxpathmid) != undefined) {
                    throw 'break';
                }
                next = doc.iterateNext();
            }
        } catch (error) { }
        if (locator.includes("preceding")) {
            indexedXpath = `${allXpathAttr}[${index}]`;
        } else {
            if (index > 1) {
                indexedXpath = `(${allXpathAttr})[${index}]`;
            } else {
                indexedXpath = `${allXpathAttr}`;
            }
        }
        if (index <= maxIndex) {
            let c = getCountForEachXpath(indexedXpath)
            if (c > 0) {
                return indexedXpath;
            }
        } else
            return null;
    } catch (error) { }
}

function getTextBasedXpath(element, tagName, boolAnchor) {
    let textBasedXpath = null;
    let checkReturn;
    let link;
    let hasSpace = false;
    let gotPartial = false;
    if (element.textContent.length > 0) {
        if (tagName === 'a') {
            link = element.textContent;
            if (element.childElementCount > 0) {
                link = element.children[0].innerText;
                if (link != undefined) {
                    let partialLink = `//a[contains(text(),'${link.trim()}')]`;
                    if (getCountForEachXpath(partialLink) == 1) {
                        xpathArray.push([0, 'Partial Link Text : ', link.trim()])
                        gotPartial = true;
                    }
                } else {
                    link = element.textContent;
                }
            }
            let temp = `//a[contains(text(),'${link.trim()}')]`
            checkReturn = link.match(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g);
            if (checkReturn && gotPartial == false) {
                link = link.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, " ")
                hasSpace = link.match(/\s/g);
                if (hasSpace) {
                    link = link.replace(/\s+/g, " ");
                    xpathArray.push([0, 'Link Text : ', link.trim()])
                }
            } else if (gotPartial == false && getCountForEachXpath(temp) == 1) {
                xpathArray.push([0, 'Link Text : ', link.trim()])
            } else if (gotPartial == false && getCountForEachXpath(`//a[text()='${link.trim()}']`) == 1) {
                xpathArray.push([0, 'Link Text : ', link.trim()])
            } else if (gotPartial == false && getCountForEachXpath(`//a[text()='${link.trim()}']`) > 1 && boolAnchor != 0) {
                let linkxpath = addIndexToXpath(temp);
                xpathArray.push([0, 'Link Text : ', linkxpath])
            }
        }
        if (hasSpace) {
            let normalizeSpace = `//${tagName}[text()[normalize-space()='${link.trim()}']]`;
            let validNSXP = getCountForEachXpath(normalizeSpace)
            if (validNSXP == 1) {
                xpathArray.push([6, 'ze Space Text', zeSpace])
            } else if (validNSXP > 1) {
                let xp = addIndexToXpath(normalizeSpace)
                if (xp != null && xp != undefined)
                    xpathArray.push([6, 'Normalize Space Text', xp])
            }
        }
        if (tagName != "select" && tagName != 'a') {
            let innerText = element.textContent;

            let hasBr = false;
            if (innerText.match(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g)) {
                hasSpace = innerText.match(/\s/g);
                if (hasSpace) {
                    innerText = innerText.replace(/\s+/g, " ");
                    if (innerText != " ") {
                        textBasedXpath = `//${tagName}[text()[normalize-space()='${innerText.trim()}']]`;
                    }
                    let validText = getTextCount(textBasedXpath)
                    while (validText) {
                        return textBasedXpath;
                    }
                }
            } else {
                textBasedXpath = `//${tagName}[text()='${innerText}']`;
                let simpleText = getTextCount(textBasedXpath);
                while (simpleText) {
                    return simpleText;
                }
            }
            let findBr = element.childNodes;
            let otherChild = element.childNodes;
            for (let br in findBr) {
                if (findBr[br].nodeName === 'BR') {
                    hasBr = true;
                    break;
                }
            }
            if (hasBr) {
                let containsdotText = '[contains(.,\'' + innerText.trim() + '\')]';
                textBasedXpath = '//' + tagName + containsdotText;
                let containsDotText = getTextCount(textBasedXpath);
                while (containsDotText) {
                    return containsDotText;
                }
            } else if (otherChild.length > 1) {
                let temp = null;
                for (let i = 0; i < otherChild.length; i++) {
                    if ((otherChild[i].textContent.length > 1) && (otherChild[i].textContent.match(/\w/g))) {
                        temp = otherChild[i].textContent;
                        textBasedXpath = '//' + tagName + '[text()=\'' + temp + '\']';
                        let otherChilText = getTextCount(textBasedXpath);
                        while (otherChilText) {
                            return otherChilText;
                        }
                    }
                }
            }
            if (innerText.length > 0) {
                if (innerText.match(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g)) {
                    hasSpace = innerText.match(/\s/g);
                    if (hasSpace) {
                        innerText = innerText.replace(/\s+/g, " ");
                        textBasedXpath = `//${tagName}[text()[normalize-space()='${innerText.trim()}']]`;
                    }
                } else if (innerText.match("\\s")) {
                    let containsText = '[contains(text(),\'' + innerText.trim() + '\')]';
                    textBasedXpath = '//' + tagName + containsText;
                    if (getCountForEachXpath(textBasedXpath) == 0) {
                        let t = innerText.split(/\u00a0/g)[1];
                        textBasedXpath = `//${tagName}[text()='${t}']`;
                    } else if (getCountForEachXpath(textBasedXpath) === 0) {
                        let startsWith = '[starts-with(text(),\'' + innerText.split(/\u00a0/g)[0].trim() + '\')]';
                        textBasedXpath = '//' + tagName + startsWith;
                    }
                }
            }
        }
        let count = getCountForEachXpath(textBasedXpath);
        if (count == 0 || count == undefined) {
            textBasedXpath = null;
        } else if (count > 1) {
            textBasedXpath = addIndexToXpath(textBasedXpath);
        }
        if (textBasedXpath.startsWith('//') || textBasedXpath.startsWith('(')) {
            let len = textBasedXpath.split('\'').length;
            if (len > 2) {
                let firstIndex = textBasedXpath.indexOf('\'');
                let temp = textBasedXpath.replace(textBasedXpath.charAt(firstIndex), `"`);
                let lastIndex = temp.lastIndexOf('\'');
                textBasedXpath = setCharAt(temp, lastIndex, '"');
            }
        }
        return textBasedXpath;
    }
}
function setCharAt(str, index, chr) {
    if (index > str.length - 1)
        return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
}
function getTextCount(text) {
    let c = getCountForEachXpath(text)
    if (c == 0 || c == undefined) {
        return null;
    } else if (c == 1) {
        return text;
    } else {
        return text = addIndexToXpath(text)
    }
}
function getParentId(element, tagName) {
    let clicketItemId = element.id;
    let re = new RegExp('\\d{' + maxId + ',}', '\g');
    let matches = re.test(clicketItemId);
    if ((clicketItemId != null) && (clicketItemId.length > 0) && matches == false) {
        let temp = `//${tagName}[@id='${clicketItemId}']`;
        return temp;
    } else
        return null;

}
function getParentName(element, tagName) {
    let clickedItemName = element.name;
    let matches = clickedItemName.match(/\d{3,}/g);
    if (!((clickedItemName === "") || (clickedItemName === undefined))) {
        let tempName = `//${tagName}[@name='${clickedItemName}']`
        return tempName;
    } else
        return null;
}
function getParentClassName(element, tagName) {
    let clickedItemClass = element.className;
    let splitClass = clickedItemClass.trim().split(" ");
    if (splitClass.length > 2) {
        let cl = `${splitClass[0]} ${splitClass[1]}`;
        let temp = `//${tagName}[contains(@class,'${cl}')]`;
        return temp;
    } else if (!((clickedItemClass === "") || (clickedItemClass === undefined))) {
        let tempClass = `//${tagName}[@class='${clickedItemClass}']`
        return tempClass;
    } else
        return null;
}
function getIdBasedXpath(element, tagName) {
    let idBasedXpath = null;
    let clicketItemId = element.id;
    let re = new RegExp('\\d{' + maxId + ',}', '\g');
    let matches = re.test(clicketItemId);
    if ((clicketItemId != null) && (clicketItemId.length > 0) && matches == false) {
        let tempId = "[@id=\'" + clicketItemId + "\']";
        idBasedXpath = '//' + '*' + tempId;
        let count = getCountForEachXpath(idBasedXpath)
        if (count == 0) {
            return null;
        } else if (count == 1) {
            idBasedXpath = '//' + tagName + tempId;
            AxesUnique.push([1, 'Id based XPath:', idBasedXpath])
            return clicketItemId;
        } else {
            idBasedXpath = '//' + tagName + tempId;
            if (count > 1) {
                idBasedXpath = addIndexToXpath(idBasedXpath)
                if (idBasedXpath != null) {
                    xpathArray.push([1, 'Id based XPath:', idBasedXpath])
                }
                return null;
            }
        }
    }
    return idBasedXpath;
}
function getClassBasedXpath(element, tagName) {
    let classBasedXpath = null;
    let clickedItemClass = element.className;
    let splitClass = clickedItemClass.trim().split(" ");
    if (splitClass.length > 2) {
        let cl = `${splitClass[0]} ${splitClass[1]}`;
        let temp = `//${tagName}[contains(@class,'${cl}')]`;
        let count = getCountForEachXpath(temp)
        if (count == 0) {
            return null;
        } else if (count > 1) {
            temp = addIndexToXpath(temp)
        }
        return temp;
    }
    if (!((clickedItemClass === "") || (clickedItemClass === undefined))) {
        let tempClass = `//*[@class='${clickedItemClass}']`;
        let count = getCountForEachXpath(tempClass);
        let spl = clickedItemClass.trim().split(" ")
        if (count == 1 && spl.length == 1) {
            classBasedXpath = `//${tagName}[@class='${clickedItemClass}']`;
            AxesUnique.push([3, 'Class based XPath:', classBasedXpath])
            xpathArray.push([3, 'ClassName is unique', clickedItemClass]);
            return null;
        } else {
            classBasedXpath = `//${tagName}[@class='${clickedItemClass}']`;
            let count = getCountForEachXpath(classBasedXpath)
            if (count == 0) {
                return null;
            } else if (count == 1) {
                return classBasedXpath;
            } else {
                classBasedXpath = addIndexToXpath(classBasedXpath)
            }
        }
    }
    return classBasedXpath;
}
function getNameBasedXpath(element, tagName) {
    let nameBasedXpath = null;
    let clickedItemName = element.attributes.name.value;
    let matches = clickedItemName.match(/\d{3,}/g);
    if (!((clickedItemName === "") || (clickedItemName === undefined) || matches != null)) {
        let tempName = "[@name=\'" + clickedItemName + "\']";
        let tem = `//*${tempName}`;
        let count = getCountForEachXpath(tem)
        if (count == 1) {
            tem = `//${tagName}${tempName}`;
            AxesUnique.push([2, 'Name based Xpath:', tem])
            xpathArray.push([2, 'Name is unique:', clickedItemName])
        } else if (count > 1) {
            tem = `//${tagName}${tempName}`;
            nameBasedXpath = addIndexToXpath(tem)
        }
    }
    return nameBasedXpath;
}
function getCountForEachXpath(element) {
    try {
        return document.evaluate('count(' + element + ')', document, null, XPathResult.ANY_TYPE, null).numberValue;
    } catch (error) { }
}
function evaluateXpath(element) {
    try {
        return document.evaluate(element, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    } catch (error) { }
}