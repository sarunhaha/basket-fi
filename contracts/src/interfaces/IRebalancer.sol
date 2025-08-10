// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRebalancer
 * @notice Interface for the Rebalancer contract
 * @dev Automated rebalancing logic for maintaining target allocations
 */
interface IRebalancer {
    // Events
    event RebalanceExecuted(
        address indexed basket,
        uint256[] oldWeights,
        uint256[] newWeights,
        uint256 gasUsed
    );
    
    event RebalanceThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event MaxSlippageUpdated(uint256 oldSlippage, uint256 newSlippage);
    event RebalanceScheduled(address indexed basket, uint256 executeAt);
    event RebalanceCancelled(address indexed basket);

    // Errors
    error BasketNotRegistered();
    error RebalanceNotNeeded();
    error SlippageExceeded();
    error RebalanceTooSoon();
    error InvalidThreshold();
    error InvalidSlippage();
    error ExecutionFailed();

    // Structs
    struct RebalanceConfig {
        uint256 threshold; // Basis points deviation to trigger rebalance
        uint256 maxSlippage; // Maximum allowed slippage in basis points
        uint256 minInterval; // Minimum time between rebalances
        bool autoRebalance; // Whether to enable automatic rebalancing
    }

    struct RebalanceInfo {
        address basket;
        uint256 lastRebalance;
        uint256 scheduledAt;
        bool isScheduled;
        RebalanceConfig config;
    }

    // View Functions
    function getRebalanceInfo(address basket) external view returns (RebalanceInfo memory);
    function needsRebalance(address basket) external view returns (bool, uint256[] memory);
    function calculateOptimalWeights(address basket) external view returns (uint256[] memory);
    function estimateRebalanceCost(address basket) external view returns (uint256);
    function getDefaultConfig() external view returns (RebalanceConfig memory);

    // State Changing Functions
    function registerBasket(address basket, RebalanceConfig calldata config) external;
    function updateConfig(address basket, RebalanceConfig calldata config) external;
    function scheduleRebalance(address basket) external;
    function executeRebalance(address basket) external;
    function cancelRebalance(address basket) external;
    function setDefaultConfig(RebalanceConfig calldata config) external;
    function emergencyStop(address basket) external;
}