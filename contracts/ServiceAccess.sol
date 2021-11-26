//SPDX-License-Identifier: GNU
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

// Determines which contracts have access to creating a project on UpsilonX.
// This can be a centralized system, or can be transferred to a DAO.
contract ServiceAccess is Ownable {

    /* 
     * There's space for 255 permissions, but it is likely that this many
     * will not be used. The first bit is determined to be a master key,
     * or to have access to all permissions. That way, it is easy to check
     * for master access if permissions % 1 == 1.
     */
    mapping(address => uint256) public permissions;
    mapping(uint8 => bool) public publicPermissons;

    constructor() {
        permissions[msg.sender] = 1;
    }

    function hasPermission(address a, uint8 permission) external view returns(bool) {
        uint256 perm = permissions[a];
        return publicPermissons[permission] || perm % 2 == 1 || (perm >> permission) % 2 == 1;
    }

    function setPermissions(address a, uint256 permission) external onlyOwner {
        permissions[a] = permission;
    }

    function addPermission(address a, uint8 permission) external onlyOwner {
        permissions[a] = permissions[a] | (1 << permission);
    }

    function removePermission(address a, uint8 permission) external onlyOwner {
        permissions[a] = permissions[a] & (type(uint256).max ^ (1 << permission));
    }

    function setPublicAccess(uint8 permission, bool publicAccess) external onlyOwner {
        publicPermissons[permission] = publicAccess;
    }
}