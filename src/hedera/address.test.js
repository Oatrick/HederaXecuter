import mainnetNodeAddresses from './address_mainnet'
import testnetNodeAddresses from './address_testnet'
import i from './internal'

test('looping random node addr', async () => {
    console.log(process.env.NODE_ENV)
    let mainnetAddress = i.randNodeAddr(mainnetNodeAddresses)
    console.log(mainnetAddress)

    let testnetAddress = i.randNodeAddr(testnetNodeAddresses)
    console.log(testnetAddress)
    // let file = '0.0.101'
    // let a = await fileGetContentsController(file)
    // console.log(a)
})
