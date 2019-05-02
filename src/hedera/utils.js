// returns an enum key, given the enum and an enum value
function enumKeyByValue(enumObject, value) {
    return Object.keys(enumObject).find(key => enumObject[key] === value)
}

export { enumKeyByValue }
