//SPDX-License-Identifier: GNU
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ServiceAccess.sol";

contract PermissionedContract is Ownable {

    uint8 public permission;
    ServiceAccess public serviceAccess;

    constructor(ServiceAccess _access) {
        serviceAccess = _access;
    }

    modifier permissioned(address user) {
        require(serviceAccess.hasPermission(user, permission), "UpsilonX: Permission not granted.");
        _;
    }

    modifier managerPermissioned(address user, address manager) {
        require(
            serviceAccess.hasPermissionAndIsManager(user, permission, manager), 
            "UpsilonX: Permission not granted."
        );
        _;
    }

    modifier specPermissioned(address user, uint8 _permission) {
        require(serviceAccess.hasPermission(user, _permission), "UpsilonX: Permission not granted.");
        _;
    }

    modifier specManagerPermissioned(address user, uint8 _permission, address manager) {
        require(
            serviceAccess.hasPermissionAndIsManager(user, _permission, manager), 
            "UpsilonX: Permission not granted."
        );
        _;
    }

    function setContractPermission(uint8 _permission) public onlyOwner {
        permission = _permission;
    }
}