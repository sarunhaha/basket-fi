// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IBasketToken.sol";

/**
 * @title IBasketFactory
 * @notice Interface for the BasketFactory contract
 * @dev Factory contract for creating and managing basket tokens
 */
interface IBasketFactory {
    // Events
    event BasketCreated(
        address indexed basket,
        address indexed creator,
        string name,
        string symbol,
        address[] tokens,
        uint256[] weights
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event BasketPaused(address indexed basket);
    event BasketUnpaused(address indexed basket);

    // Errors
    error InvalidTokenCount();
    error InvalidWeights();
    error WeightsSumNotHundred();
    error TokenAlreadyExists();
    error InvalidFee();
    error InvalidFeeRecipient();
    error BasketNotFound();
    error Unauthorized();

    // Structs
    struct BasketConfig {
        string name;
        string symbol;
        address[] tokens;
        uint256[] weights; // Basis points (10000 = 100%)
        uint256 managementFee; // Annual fee in basis points
        bool isPublic;
    }

    struct BasketInfo {
        address basket;
        address creator;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 totalValue;
        bool isPaused;
        uint256 createdAt;
    }

    // View Functions
    function getBasket(uint256 basketId) external view returns (address);
    function getBasketInfo(address basket) external view returns (BasketInfo memory);
    function getBasketCount() external view returns (uint256);
    function getBasketsByCreator(address creator) external view returns (address[] memory);
    function isBasketValid(address basket) external view returns (bool);
    function getCreationFee() external view returns (uint256);
    function getFeeRecipient() external view returns (address);

    // State Changing Functions
    function createBasket(BasketConfig calldata config) external payable returns (address);
    function pauseBasket(address basket) external;
    function unpauseBasket(address basket) external;
    function setCreationFee(uint256 fee) external;
    function setFeeRecipient(address recipient) external;
    function emergencyPause() external;
    function emergencyUnpause() external;
}