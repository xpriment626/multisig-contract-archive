const MultiSig = artifacts.require("Enderun");

module.exports = function (deployer, _network, accounts) {
    deployer.deploy(MultiSig, [accounts[1], accounts[2], accounts[3]], 2, {
        from: accounts[0],
        value: 2000000000000000000,
    });
};
