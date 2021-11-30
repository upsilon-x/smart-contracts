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

        // give permission
        access.addPermission(token.address, 2);

        try {
            await smc.createICO(token.address, 0, 86400, 200000, "1000000000000000000000");
            assert(false, "ICO shouldn't be able to be made without a manager set.")
        }
        catch {}

        await access.setManager(token.address, accounts[0]);
        await smc.createICO(token.address, 0, 1938249206, 200000, "1000000000000000000000");

        const isOpen = await smc.isICOOpen(0);
        assert(isOpen, "ICO should be open after creating it.");
    });

    it("Should allow people to purchase from ICOs.", async() => {
        const smc = await SimpleICO.deployed();
        const access = await ServiceAccess.deployed();
        const token = await TestERC20.deployed();

        await smc.purchaseICO(0, {from: accounts[2], value: "10000000000000000000"});
        let tokenCnt = await token.balanceOf(accounts[2]);
        assert(tokenCnt == "19940000000000000000", "Token count from purchase is incorrect: " + tokenCnt);
        
        const fees = await smc.feesCollected();
        const offeringPayment = await smc.offeringPayments(0);
        const tokenSold = await smc.tokensSold(0);
        assert("30000000000000000" == fees, "Incorrect fees collected: " + fees);
        assert("19940000000000000000" == tokenSold, "Incorrect tokens sold: " + tokenSold);
        assert("9970000000000000000" == offeringPayment, "Incorrect offering payment: " + offeringPayment);
    });

    it("Shouldn't allow anyone to withdraw fees.", async() => {
        const smc = await SimpleICO.deployed();

        try {
            smc.withdrawfees({ from: accounts[2] });
            assert(false, "Should not allow anyone other than the owner to do collect fees.");
        }
        catch {}
    });

    it("Should be able to withdraw fees.", async() => {
        const smc = await SimpleICO.deployed();

        // large purchase to ensure that feesCollected > gas cost
        await smc.purchaseICO(0, {from: accounts[3], value: "20000000000000000000"});
        await smc.purchaseICO(0, {from: accounts[4], value: "20000000000000000000"});
        await smc.purchaseICO(0, {from: accounts[5], value: "20000000000000000000"});
        await smc.purchaseICO(0, {from: accounts[6], value: "20000000000000000000"});
        await smc.purchaseICO(0, {from: accounts[7], value: "20000000000000000000"});
        await smc.purchaseICO(0, {from: accounts[8], value: "20000000000000000000"});

        const prevBalance = await web3.eth.getBalance(accounts[0]);
        await smc.withdrawFees();
        const curBalance = await web3.eth.getBalance(accounts[0]);
        const feesCollected = await smc.feesCollected();

        assert(feesCollected == 0, "Fees collected is not 0 after collecting fees.");
        assert(prevBalance < curBalance, "Previous balance is not less than the current balance.");
    });

    it("Shouldn't allow anyone to withdraw ico paments.", async() => {
        const smc = await SimpleICO.deployed();

        try {
            await smc.withdrawICO(0, { from: accounts[2] });
            assert(false, "Should not allow anyone other than the owner to do collect fees.");
        }
        catch {}
    });


    it("Should be able to withdraw ICO.", async() => {
        const smc = await SimpleICO.deployed();
        const access = await ServiceAccess.deployed();
        const token = await TestERC20.deployed();

        const prevBalance = await web3.eth.getBalance(accounts[0]);
        //console.log(await smc.offerings(0));
        //console.log(await access.managementAllowance(token.address));

        await smc.withdrawICO(0, { from: accounts[0] });
        const curBalance = await web3.eth.getBalance(accounts[0]);
        const feesCollected = await smc.offeringPayments(0);

        assert(feesCollected == 0, "Fees collected is not 0 after collecting fees.");
        assert(prevBalance < curBalance, "Previous balance is not less than the current balance.");
    
    })

});