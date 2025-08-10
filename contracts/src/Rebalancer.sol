// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/IRebalancer.sol";
import "./interfaces/IBasketToken.sol";
import "./interfaces/IBasketFactory.sol";

/**
 * @title Rebalancer
 * @notice Automated rebalancing logic for maintaining target allocations
 * @dev Handles scheduling and execution of basket rebalancing operations
 */
contract Rebalancer is IRebalancer, Ownable, ReentrancyGuard, Pausable {
    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_THRESHOLD = 2000; // 20%
    uint256 public constant MAX_SLIPPAGE = 1000; // 10%
    uint256 public constant MIN_INTERVAL = 1 hours;
    uint256 public constant MAX_INTERVAL = 30 days;

    // State variables
    IBasketFactory public immutable factory;
    
    mapping(address => RebalanceInfo) public rebalanceInfo;
    mapping(address => bool) public registeredBaskets;
    
    RebalanceConfig public defaultConfig;
    
    // Events
    event BasketRegistered(address indexed basket, RebalanceConfig config);
    event ConfigUpdated(address indexed basket, RebalanceConfig config);
    event DefaultConfigUpdated(RebalanceConfig config);

    constructor(address _factory) {
        factory = IBasketFactory(_factory);
        
        // Set default configuration
        defaultConfig = RebalanceConfig({
            threshold: 500, // 5%
            maxSlippage: 200, // 2%
            minInterval: 24 hours,
            autoRebalance: false
        });
    }

    /**
     * @notice Registers a basket for rebalancing
     * @param basket Address of the basket token
     * @param config Rebalancing configuration
     */
    function registerBasket(address basket, RebalanceConfig calldata config) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (!factory.isBasketValid(basket)) revert BasketNotRegistered();
        
        // Only basket manager can register
        if (IBasketToken(basket).manager() != msg.sender) {
            revert BasketNotRegistered();
        }
        
        _validateConfig(config);
        
        registeredBaskets[basket] = true;
        rebalanceInfo[basket] = RebalanceInfo({
            basket: basket,
            lastRebalance: block.timestamp,
            scheduledAt: 0,
            isScheduled: false,
            config: config
        });
        
        emit BasketRegistered(basket, config);
    }

    /**
     * @notice Updates rebalancing configuration for a basket
     * @param basket Address of the basket token
     * @param config New rebalancing configuration
     */
    function updateConfig(address basket, RebalanceConfig calldata config) 
        external 
        nonReentrant 
    {
        if (!registeredBaskets[basket]) revert BasketNotRegistered();
        if (IBasketToken(basket).manager() != msg.sender) {
            revert BasketNotRegistered();
        }
        
        _validateConfig(config);
        
        rebalanceInfo[basket].config = config;
        emit ConfigUpdated(basket, config);
    }

    /**
     * @notice Schedules a rebalance for a basket
     * @param basket Address of the basket token
     */
    function scheduleRebalance(address basket) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (!registeredBaskets[basket]) revert BasketNotRegistered();
        
        RebalanceInfo storage info = rebalanceInfo[basket];
        
        // Check if rebalance is needed
        (bool needed,) = needsRebalance(basket);
        if (!needed) revert RebalanceNotNeeded();
        
        // Check minimum interval
        if (block.timestamp < info.lastRebalance + info.config.minInterval) {
            revert RebalanceTooSoon();
        }
        
        info.scheduledAt = block.timestamp;
        info.isScheduled = true;
        
        emit RebalanceScheduled(basket, block.timestamp);
    }

    /**
     * @notice Executes a scheduled rebalance
     * @param basket Address of the basket token
     */
    function executeRebalance(address basket) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (!registeredBaskets[basket]) revert BasketNotRegistered();
        
        RebalanceInfo storage info = rebalanceInfo[basket];
        if (!info.isScheduled) revert RebalanceNotNeeded();
        
        // Calculate optimal weights
        uint256[] memory newWeights = calculateOptimalWeights(basket);
        uint256[] memory oldWeights = IBasketToken(basket).getWeights();
        
        // Execute rebalance
        uint256 gasStart = gasleft();
        
        try IBasketToken(basket).rebalance(newWeights) {
            // Update state
            info.lastRebalance = block.timestamp;
            info.scheduledAt = 0;
            info.isScheduled = false;
            
            uint256 gasUsed = gasStart - gasleft();
            emit RebalanceExecuted(basket, oldWeights, newWeights, gasUsed);
        } catch {
            revert ExecutionFailed();
        }
    }

    /**
     * @notice Cancels a scheduled rebalance
     * @param basket Address of the basket token
     */
    function cancelRebalance(address basket) external {
        if (!registeredBaskets[basket]) revert BasketNotRegistered();
        if (IBasketToken(basket).manager() != msg.sender) {
            revert BasketNotRegistered();
        }
        
        RebalanceInfo storage info = rebalanceInfo[basket];
        info.scheduledAt = 0;
        info.isScheduled = false;
        
        emit RebalanceCancelled(basket);
    }

    /**
     * @notice Sets the default configuration for new baskets
     * @param config New default configuration
     */
    function setDefaultConfig(RebalanceConfig calldata config) external onlyOwner {
        _validateConfig(config);
        defaultConfig = config;
        emit DefaultConfigUpdated(config);
    }

    /**
     * @notice Emergency stop for a specific basket
     * @param basket Address of the basket token
     */
    function emergencyStop(address basket) external onlyOwner {
        if (registeredBaskets[basket]) {
            RebalanceInfo storage info = rebalanceInfo[basket];
            info.isScheduled = false;
            info.scheduledAt = 0;
            emit RebalanceCancelled(basket);
        }
    }

    // View functions
    function getRebalanceInfo(address basket) external view returns (RebalanceInfo memory) {
        return rebalanceInfo[basket];
    }

    /**
     * @notice Checks if a basket needs rebalancing
     * @param basket Address of the basket token
     * @return needed Whether rebalancing is needed
     * @return optimalWeights Calculated optimal weights
     */
    function needsRebalance(address basket) 
        public 
        view 
        returns (bool needed, uint256[] memory optimalWeights) 
    {
        if (!registeredBaskets[basket]) return (false, new uint256[](0));
        
        RebalanceConfig memory config = rebalanceInfo[basket].config;
        uint256[] memory currentWeights = IBasketToken(basket).getWeights();
        optimalWeights = calculateOptimalWeights(basket);
        
        // Check if any weight deviates beyond threshold
        for (uint256 i = 0; i < currentWeights.length; i++) {
            uint256 deviation = currentWeights[i] > optimalWeights[i] 
                ? currentWeights[i] - optimalWeights[i]
                : optimalWeights[i] - currentWeights[i];
                
            if (deviation > config.threshold) {
                needed = true;
                break;
            }
        }
    }

    /**
     * @notice Calculates optimal weights based on current market conditions
     * @param basket Address of the basket token
     * @return weights Optimal weight distribution
     */
    function calculateOptimalWeights(address basket) 
        public 
        view 
        returns (uint256[] memory weights) 
    {
        // For this minimal implementation, return current target weights
        // In a real implementation, this would use price oracles and
        // sophisticated rebalancing algorithms
        weights = IBasketToken(basket).getWeights();
    }

    /**
     * @notice Estimates the cost of rebalancing a basket
     * @param basket Address of the basket token
     * @return cost Estimated gas cost in wei
     */
    function estimateRebalanceCost(address basket) external view returns (uint256 cost) {
        if (!registeredBaskets[basket]) return 0;
        
        // Simple estimation based on number of tokens
        address[] memory tokens = IBasketToken(basket).getTokens();
        cost = tokens.length * 50000 * tx.gasprice; // Rough estimate
    }

    function getDefaultConfig() external view returns (RebalanceConfig memory) {
        return defaultConfig;
    }

    // Internal functions
    function _validateConfig(RebalanceConfig calldata config) internal pure {
        if (config.threshold > MAX_THRESHOLD) revert InvalidThreshold();
        if (config.maxSlippage > MAX_SLIPPAGE) revert InvalidSlippage();
        if (config.minInterval < MIN_INTERVAL || config.minInterval > MAX_INTERVAL) {
            revert InvalidThreshold();
        }
    }
}