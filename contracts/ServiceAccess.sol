//SPDX-License-Identifier: GNU
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/*  
    Determines which contracts have access to creating a project on UpsilonX.
    This can be a centralized system, or can be transferred to a DAO.

    Permissions are stored as uint256, meaning there are 255 "permissions" that
    can be recorded. It is unlikely that all of these permissions will be used.
    The use case is as follows:
        Contract A requires permission 5 to do action for Token B
        Contract A checks if Token B has permission 5 in ServiceAccess
    
    Management Allowances determine managers of a Token. Use case:
        Contract C only lets a manager of a Token D's project modify values
        Contract C checks if the caller has Token D access

    Management Allowances and Permissions should work together. Check if 
*/
contract ServiceAccess is Ownable {

    /* 
     * There's space for 255 permissions, but it is likely that this many
     * will not be used. The first bit is determined to be a master key,
     * or to have access to all permissions. That way, it is easy to check
     * for master access if permissions % 1 == 1.
     */
    mapping(address => uint256) public permissions;
    mapping(uint8 => bool) public publicPermissons;
    mapping(address => address) public managementAllowance;

    constructor() {
        permissions[msg.sender] = 1;
    }

    function hasPermission(address a, uint8 permission) public view returns(bool) {
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

    function setManager(address a, address manager) external {
        if(managementAllowance[a] == address(0)) {
            require(
                msg.sender == owner(), 
                "UpsilonX: no manager set, only the owner can set managers at this stage."
            );
        }
        else {
            require(
                msg.sender == managementAllowance[a],
                "UpsilonX: only the manager can set the next manager."
            );
        }

        managementAllowance[a] = manager;
    }

    function isManager(address a, address manager) public view returns(bool) {
        return managementAllowance[a] == manager;
    }

    function hasPermissionAndIsManager(address a, uint8 permission, address manager) 
        view external returns(bool) 
    {
        return hasPermission(a, permission) && isManager(a, manager);
    }
}