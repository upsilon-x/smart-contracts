const ServiceAccess = artifacts.require("ServiceAccess");
const SimpleICO = artifacts.require("SimpleICO");
const TestERC20 = artifacts.require("TestERC20");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ServiceAccess);
  const access = await ServiceAccess.deployed();

  await deployer.deploy(SimpleICO, accounts[0], 300, access.address);
  const ico = await SimpleICO.deployed();

  if(network === "develop" || network == "ropsten") {
    await deployer.deploy(TestERC20);
  }
};
