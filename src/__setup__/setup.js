import Hedera from '../hedera'
import testdata from './testdata'

Hedera.prototype.getAccountBalanceProxy = function(data) {
    return testdata.getaccountbalance
}
