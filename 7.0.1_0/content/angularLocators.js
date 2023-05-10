
function angularLocators(ele) {
    // let angularArray = []
    let attribute = ele.attributes
    let tag = ele.tagName.toLowerCase()
    console.log(`TAG NAME: ${tag}`);
    if (tag === 'button') {
        return buttonText(ele);
    } else {
        let filtered = Array.prototype.slice.call(attribute).filter(item => {
            if (item.name.startsWith('ng-') && item.value.length > 0) {
                return item;
            }
        })
        let elements = filtered.map(ele => {
            console.log(ele);
        })
        return elements;
    }
}
let buttonText = (ele) => {
    if (ele.textContent.length > 0) {
        return ele.textContent.trim()
    } else if (ele.value.length > 0) {
        return ele.value.trim()
    }
}