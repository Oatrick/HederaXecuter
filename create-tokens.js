import forge from 'node-forge'
;(async () => {
    const ed25519 = forge.pki.ed25519
    let keypair = ed25519.generateKeyPair()
    console.log('hello')
    console.log(keypair)
})()
