//SPDX-License-Identifier: GNU
pragma solidity ^0.8.4;

import "../PermissionedContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleICO is PermissionedContract {

    constructor(address _feeTo, uint16 _fee, ServiceAccess _access)
        PermissionedContract(_access) 
    {
        feeTo = payable(_feeTo);
        fee = _fee;
        permission = 2;
    }

    address payable public feeTo;
    uint16 public fee = 300; // 300 = 0.3%
    uint public feesCollected;

    struct SimpleOffering {
        uint icoStartTime;
        uint icoEndTime;
        uint tokenRate; // 150000 = 1 ETH : 1.5 Tokens
        uint tokensToSell;
        IERC20 tokenAddress;
        address owner;
    }

    uint public nextOfferingId;
    mapping(uint => SimpleOffering) public offerings;
    mapping(uint => uint) public offeringPayments;
    mapping(uint => uint) public tokensSold;

    modifier icoExists(uint icoId) {
        require(nextOfferingId > icoId, "UpsilonX: ICO must exist.");
        _;
    }

    modifier icoOpen(uint icoId) {
        require(isICOOpen(icoId), "UpsilonX: ICO must be open.");
        _;
    }

    // start ico
    function createICO(IERC20 token, uint icoStartTime, uint icoEndTime, uint tokenRate, uint tokensToSell) 
        external managerPermissioned(address(token), msg.sender) 
    {
        require(token.balanceOf(address(this)) >= tokensToSell, "UpsilonX: not enough tokens in the contract.");
        require(icoEndTime > icoStartTime, "Cannot create ico time less than current ico.");
        address sender = msg.sender;
        offerings[nextOfferingId] = 
            SimpleOffering(icoStartTime, icoEndTime, tokenRate, tokensToSell, token, sender);
        nextOfferingId += 1;

        // TODO: emit event
    }

    // purchase ico
    function purchaseICO(uint icoId) payable external 
        icoExists(icoId) 
        icoOpen(icoId) 
    {

        uint paid = msg.value;
        uint tokenOwned = offerings[icoId].tokenAddress.balanceOf(address(this));
        uint remainingTokens =  offerings[icoId].tokensToSell - tokensSold[icoId];

        // 1:   remove tax from paid and add it to total tax
        uint tax = paid * fee;
        tax /= 100000;
        paid -= tax;
        feesCollected += tax;

        // 2:   divide paid by token amount
        uint tokensToBuy = paid * offerings[icoId].tokenRate / 1e5;

        // 3:   check if there are enough remaining tokens
        require(tokensToBuy <= remainingTokens, "UpsilonX: These many tokens cannot be purchased.");
        require(tokensToBuy <= tokenOwned, "UpsilonX: Contract doesn't have enough tokens.");

        // 4:   send tokens
        tokensSold[icoId] += tokensToBuy;
        offerings[icoId].tokenAddress.transfer(msg.sender, tokensToBuy);

        // 5:   add offeringPayments to contract afterwards, 
        //      so that no one can try to withdraw extra eth during the send step
        offeringPayments[icoId] += paid;
    }

    // withdraw ico payments
    function withdrawICO(uint icoId) external 
        icoExists(icoId) 
        managerPermissioned(address(offerings[icoId].tokenAddress), msg.sender)
    {
        //require(block.timestamp > offerings[icoId].icoEndTime, "ICO not over.");
        uint payment = offeringPayments[icoId];
        offeringPayments[icoId] = 0;
        payable(offerings[icoId].owner).transfer(payment);
    }

    // check if ico is open
    function isICOOpen(uint icoId) public view returns(bool) {
        if(icoId >= nextOfferingId) return false;
        return block.timestamp <= offerings[icoId].icoEndTime && 
            block.timestamp >= offerings[icoId].icoStartTime;
    }



    // withdraw fees
    function withdrawFees() external {
        require(msg.sender == feeTo, "UpsilonX: Not allowed.");
        uint fees = feesCollected;
        feesCollected = 0;
        feeTo.transfer(fees);
    }

    // set feeTo
    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeTo, "UpsilonX: Not allowed.");
        feeTo = payable(_feeTo);
    }
}