// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FundMe {
    // user can deposit ether into this contract
    // owner of this contract can withdraw funds
    // get balance of the funded amount
    address public owner;
    mapping (address => uint256) public balances; // balances(0x79f681AA66Dcb6ec724a122D2e61e8fD7B8eCA6b)

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "must be owner");
        _;
    }

    function desposit() public payable {
        require(msg.value > 0, "must be more than 0"); // 0.01 ether
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(balances[msg.sender] >= amount, "Insufficient Balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function getBalance() public view returns (uint256) {
        return balances[msg.sender]; 
    }
}