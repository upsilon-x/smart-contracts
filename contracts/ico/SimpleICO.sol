//SPDX-License-Identifier: GNU
pragma solidity ^0.8.4;

import "../PermissionedContract.sol";

contract SimpleICO is PermissionedContract {

    constructor(address _feeTo, uint16 _fee, ServiceAccess _access)
        PermissionedContract(_access) 
    {
        feeTo = _feeTo;
        fee = _fee;
    }

    address public feeTo;
    uint16 public fee;
    uint256 public feesCollected;

    struct SimpleOffering {
        bool icoCompleted;
        uint icoStartTime;
        uint icoEndTime;
        uint tokenRate;
        address tokenAddress;
        uint fundingGoal;
        address owner;
    }

    uint public nextOfferingId;
    mapping(uint => SimpleOffering) offerings;
    mapping(uint => uint) offeringPayments;

    // start ico

    // purchase ico

    // withdraw ico payments

    // check if ico is open



    // withdraw fees

    // set fee

    // set feeTo
}