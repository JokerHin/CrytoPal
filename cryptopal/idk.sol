// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoPalWallet {
    mapping(address => uint256) public balances;
    address public owner;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
         require(msg.value > 0, "must be more than 0"); // 0.01 ether
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value); // 🔥 Add event
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient funds");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount); // 🔥 Add event
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}
