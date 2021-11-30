const ServiceAccess = artifacts.require('ServiceAccess');
const SimpleICO = artifacts.require('SimpleICO');
const TestERC20 = artifacts.require('TestERC20');

contract('SimpleICO', accounts => {

    it('Should have the correct starting values.', async () => {
        const smc = await SimpleICO.deployed();

        let feeTo = await smc.feeTo();
        let fee = await smc.fee();
        let feesCollected = await smc.feesCollected();
        assert(feeTo == accounts[0], "Incorrect feeTo.");
        assert(fee == 300, "Incorrect fee: " + fee);
        assert(feesCollected == 0, "feesCollected isn't 0.");
    });

    it('Should not allow anyone to create an ico.', async() => {
        const smc = await SimpleICO.deployed();
        const token = await TestERC20.deployed();
        const now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;

        token.transfer(smc.address, "10000000000000000000000");

        try {
            await smc.createICO(token.address, 0, 86400, 200000, 10000);
            assert(false, "ICO shouldn't be able to be made since there are no permissions granted.")
        }
        catch {
            // this is good
        }
    });

    it('Should create an ICO after giving permission.', async() => {
        const smc = await SimpleICO.deployed();
        const access = await ServiceAccess.deployed();
        const token = await TestERC20.deployed();
        const now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;

        // give permission
        access.addPermission(token.address, 2);

        try {
            await smc.createICO(token.address, 0, 86400, 200000, 10000);
            assert(false, "ICO shouldn't be able to be made without a manager set.")
        }
        catch {}

        await access.setManager(token.address, accounts[0]);
        await smc.createICO(token.address, 0, 1938249206, 200000, 10000);

        const isOpen = await smc.isICOOpen(0);
        assert(isOpen, "ICO should be open after creating it.");
    });

    it("Should allow people to purchase from ICOs.", async() => {

    });

});