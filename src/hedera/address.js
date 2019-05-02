import addressBook from './address-book'

// Based on current node environment, use the appropriate address book

const getRandomNode = () => {
    const ADDRESS_BOOK = addressBook[process.env.NODE_ENV]
    const randomNode =
        ADDRESS_BOOK[Math.floor(Math.random() * ADDRESS_BOOK.length)]
    const nodeAccount = Object.keys(randomNode)[0]
    const nodeAddress = randomNode[nodeAccount]
    return {
        nodeAccount,
        nodeAddress
    }
}

const getNodeAddressFromNodeAccount = nodeAccount => {
    const ADDRESS_BOOK = addressBook[process.env.NODE_ENV]['ADDRESS_BOOK']
    for (let i = 0; i < ADDRESS_BOOK.length; i++) {
        let currentNode = ADDRESS_BOOK[i]
        let currentNodeAccount = Object.keys(currentNode)[0]
        if (currentNodeAccount === nodeAccount) {
            // this is the nodeAddress
            return currentNode[nodeAccount]
        }
    }
    return undefined
}

export default { getNodeAddressFromNodeAccount, getRandomNode }
