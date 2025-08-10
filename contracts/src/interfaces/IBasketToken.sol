// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IBasketToken
 * @notice Interface for BasketToken contract
 * @dev ERC-20 index token representing a diversified portfolio
 */
interface IBasketToken is IERC20 {
    // Events
    event Mint(address indexed to, uint256 amount, uint256[] tokenAmounts);
    event Burn(address indexed from, uint256 amount, uint256[] tokenAmounts);
    event Rebalance(uint256[] oldWeights, uint256[] newWeights);
    event WeightsUpdated(uint256[] newWeights);
    event ManagementFeeCollected(uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    // Errors
    error InsufficientBalance();
    error InsufficientAllowance();
    error InvalidAmount();
    error InvalidWeights();
    error SlippageExceeded();
    error RebalanceInProgress();
    error Paused();
    error OnlyFactory();
    error OnlyManager();

    // Structs
    struct TokenInfo {
        address token;
        uint256 weight; // Basis points (10000 = 100%)
        uint256 balance;
        uint256 lastPrice;
    }

    struct MintParams {
        uint256 basketAmount;
        uint256[] maxTokenAmounts;
        uint256 deadline;
    }

    struct BurnParams {
        uint256 basketAmount;
        uint256[] minTokenAmounts;
        uint256 deadline;
    }

    // View Functions
    function factory() external view returns (address);
    function manager() external view returns (address);
    function getTokens() external view returns (address[] memory);
    function getWeights() external view returns (uint256[] memory);
    function getTokenInfo(address token) external view returns (TokenInfo memory);
    function getBasketValue() external view returns (uint256);
    function getMintAmount(uint256 ethAmount) external view returns (uint256, uint256[] memory);
    function getBurnAmount(uint256 basketAmount) external view returns (uint256[] memory);
    function managementFee() external view returns (uint256);
    function lastFeeCollection() external view returns (uint256);
    function isPaused() external view returns (bool);

    // State Changing Functions
    function mint(MintParams calldata params) external payable returns (uint256);
    function burn(BurnParams calldata params) external returns (uint256[] memory);
    function rebalance(uint256[] calldata newWeights) external;
    function collectManagementFee() external;
    function pause() external;
    function unpause() external;
    function emergencyWithdraw(address token) external;
}