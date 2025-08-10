// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/BasketFactory.sol";

contract DeployBasketFactoryScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        uint256 creationFee = vm.envOr("CREATION_FEE", uint256(0.01 ether));
        
        vm.startBroadcast(deployerPrivateKey);
        
        BasketFactory factory = new BasketFactory(creationFee, feeRecipient);
        
        console.log("BasketFactory deployed at:", address(factory));
        console.log("Creation fee:", creationFee);
        console.log("Fee recipient:", feeRecipient);
        
        vm.stopBroadcast();
    }
}