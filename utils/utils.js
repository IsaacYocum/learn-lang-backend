module.exports.isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports.isEmptyArray = (array) => {
    return Array.isArray(array) && array.length === 0
}