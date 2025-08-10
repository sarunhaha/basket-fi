// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/BasketFactory.sol";
import "../src/Rebalancer.sol";

contract DeployScript is Script {
    // Configuration
    uint256 public constant CREATION_FEE = 0.01 ether;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy BasketFactory
        BasketFactory factory = new BasketFactory(CREATION_FEE, feeRecipient);
        console.log("BasketFactory deployed at:", address(factory));
        
        // Deploy Rebalancer
        Rebalancer rebalancer = new Rebalancer(address(factory));
        console.log("Rebalancer deployed at:", address(rebalancer));
        
        vm.stopBroadcast();
        
        // Save deployment addresses
        _saveDeployment(address(factory), address(rebalancer));
    }
    
    function _saveDeployment(address factory, address rebalancer) internal {
        string memory json = "deployment";
        vm.serializeAddress(json, "BasketFactory", factory);
        vm.serializeAddress(json, "Rebalancer", rebalancer);
        
        string memory finalJson = vm.serializeAddress(json, "timestamp", address(uint160(block.timestamp)));
        
        string memory network = vm.envString("NETWORK");
        string memory path = string.concat("./deployments/", network, ".json");
        
        vm.writeJson(finalJson, path);
        console.log("Deployment saved to:", path);
    }
}