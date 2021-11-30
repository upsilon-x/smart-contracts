//SPDX-License-Identifier: GNU
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor() ERC20("Test ERC20", "T-ERC") {
        _mint(msg.sender, 1000000 ether);
    }
}