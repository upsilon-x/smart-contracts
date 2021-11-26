const ServiceAccess = artifacts.require("ServiceAccess");

module.exports = function (deployer) {
  deployer.deploy(ServiceAccess);
};
