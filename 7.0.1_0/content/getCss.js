
checkforInt = (id) => {
    return new RegExp('\\d{2,}', '\g').test(id);
}
function getLongCssPath(ele) {
    var cssPath = [];
    while (ele.nodeType === 1) {
        let tag = ele.tagName.toLowerCase();
        let id = ele.id;
        if (id && !checkforInt(id)) {
            tag += `#${ele.id}`;
            cssPath.unshift(tag);
            break;
        } else {
            let prevSib = ele, position = 1;
            while (prevSib = prevSib.previousElementSibling) {
                if (prevSib.tagName.toLowerCase() == tag) position++;
            }
            if (position != 1) tag += `:nth-of-type(${position})`
        }
        cssPath.unshift(tag);
        ele = ele.parentNode
    }
    return cssPath.join(">");
}
// version 3.1.0 id = ilcoelkkcokgeeijnopjnolmmighnppp
/***
 * @see  https://www.testleaf.com
 * @since - 2019 - Feb
 */


// css locatrs -- basics--
function getCSS(element, tagName) {
    cssPathArray = [];
    Array.prototype.slice.call(element.attributes).forEach(function (item) {
        if (!filterAttributesFromElement(item)) {
            switch (item.name) {
                case 'id':
                    let id = `${tagName}#${item.value}`
                    cssPathArray.push([0, 'Css', id])
                    break;
                case 'class':
                    let classN = `${tagName}.${item.value}`;
                    cssPathArray.push([0, 'Css', classN])
                    break;
                default:
                    let attribuitesBased = `${tagName}[${item.name}='${item.value}']`
                    cssPathArray.push([0, 'Css', attribuitesBased])
                    break;
            }
        }
    });
}