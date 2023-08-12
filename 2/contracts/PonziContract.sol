// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
/* 
The contract logic itself perpetuates a Ponzi scheme, which is illegal in many jurisdictions. 
Deploying or interacting with such contracts can lead to legal repercussions.
*/
contract PonziContract is ReentrancyGuard, Ownable {
    event RegistrationDeadline(uint256 registrationDeadline);
    event Withdraw(uint256 amount);
    uint256 private registrationDeadline;
    address[] public affiliates_;
    mapping(address => bool) public affiliates;
    uint256 public affiliatesCount;

    //Could be better (possible gas issues)
    modifier onlyAfilliates() {
        bool affiliate;
        for (uint256 i = 0; i < affiliatesCount; i++) {
            if (affiliates_[i] == msg.sender) {
                affiliate = true;
            }
        }
        require(affiliate == true, "Not an Affiliate!");
        _;
    }

    function setDeadline(uint256 _regDeadline) external onlyOwner {
        registrationDeadline = _regDeadline;
        emit RegistrationDeadline(registrationDeadline);
    }

    /* 
        problem 1 [Critical]:
        thIS function joinPonzi sends ether to a list of addresses before updating
        its internal state (affiliatesCount, affiliates, and affiliates_).
        This ordering allows for a reentrancy attack.
        problem 2 [High]:
        When making external calls with .call, it returns a boolean indicating success 
        or failure. This boolean value is not checked, meaning that the function doesn't 
        revert if an external call fails.
    */

    function joinPonzi(
        address[] calldata _afilliates
    ) external payable nonReentrant {
        require(
            block.timestamp < registrationDeadline,
            "Registration not Active!"
        );
        require(_afilliates.length == affiliatesCount, "Invalid length");
        require(msg.value == affiliatesCount * 1 ether, "Insufficient Ether");
        for (uint256 i = 0; i < _afilliates.length; i++) {
            _afilliates[i].call{value: 1 ether}("");
        }
        affiliatesCount += 1;

        affiliates[msg.sender] = true;
        affiliates_.push(msg.sender);
    }

    function buyOwnerRole(address newAdmin) external payable onlyAfilliates {
        require(msg.value == 10 ether, "Invalid Ether amount");
        _transferOwnership(newAdmin);
    }

    function ownerWithdraw(address to, uint256 amount) external onlyOwner {
        payable(to).call{value: amount}("");
        emit Withdraw(amount);
    }

    function addNewAffilliate(address newAfilliate) external onlyOwner {
        affiliatesCount += 1;
        affiliates[newAfilliate] = true;
        affiliates_.push(newAfilliate);
    }

    receive() external payable {}
}
