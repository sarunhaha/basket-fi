// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IBasketToken.sol";

/**
 * @title BasketToken
 * @notice ERC-20 index token representing a diversified portfolio
 * @dev Implements minting, burning, and rebalancing functionality
 */
contract BasketToken is IBasketToken, ERC20, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Address for address payable;

    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant MIN_MINT_AMOUNT = 1e15; // 0.001 ETH
    
    // State variables
    address public immutable factory;
    address public immutable manager;
    
    address[] public tokens;
    mapping(address => uint256) public tokenIndex;
    mapping(address => TokenInfo) public tokenInfo;
    
    uint256 public managementFee; // Annual fee in basis points
    uint256 public lastFeeCollection;
    
    bool private _rebalancing;
    
    // Modifiers
    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }
    
    modifier onlyManager() {
        if (msg.sender != manager) revert OnlyManager();
        _;
    }
    
    modifier whenNotRebalancing() {
        if (_rebalancing) revert RebalanceInProgress();
        _;
    }
    
    modifier validDeadline(uint256 deadline) {
        require(block.timestamp <= deadline, "Deadline exceeded");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address[] memory _tokens,
        uint256[] memory _weights,
        uint256 _managementFee,
        address _manager,
        address _factory
    ) ERC20(name, symbol) {
        factory = _factory;
        manager = _manager;
        managementFee = _managementFee;
        lastFeeCollection = block.timestamp;
        
        // Initialize tokens and weights
        for (uint256 i = 0; i < _tokens.length; i++) {
            tokens.push(_tokens[i]);
            tokenIndex[_tokens[i]] = i;
            tokenInfo[_tokens[i]] = TokenInfo({
                token: _tokens[i],
                weight: _weights[i],
                balance: 0,
                lastPrice: 0
            });
        }
    }

    /**
     * @notice Mints basket tokens by depositing underlying assets
     * @param params Mint parameters including amounts and slippage protection
     * @return basketAmount Amount of basket tokens minted
     */
    function mint(MintParams calldata params) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        whenNotRebalancing
        validDeadline(params.deadline)
        returns (uint256 basketAmount) 
    {
        if (params.basketAmount < MIN_MINT_AMOUNT) revert InvalidAmount();
        
        // Calculate required token amounts
        uint256[] memory tokenAmounts = new uint256[](tokens.length);
        uint256 totalValue = getBasketValue();
        
        if (totalSupply() == 0) {
            // First mint - use provided ETH value
            basketAmount = msg.value;
            for (uint256 i = 0; i < tokens.length; i++) {
                tokenAmounts[i] = (msg.value * tokenInfo[tokens[i]].weight) / BASIS_POINTS;
            }
        } else {
            // Subsequent mints - proportional to existing supply
            basketAmount = params.basketAmount;
            for (uint256 i = 0; i < tokens.length; i++) {
                tokenAmounts[i] = (tokenInfo[tokens[i]].balance * basketAmount) / totalSupply();
                if (tokenAmounts[i] > params.maxTokenAmounts[i]) {
                    revert SlippageExceeded();
                }
            }
        }
        
        // Transfer tokens from user
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokenAmounts[i] > 0) {
                IERC20(tokens[i]).safeTransferFrom(msg.sender, address(this), tokenAmounts[i]);
                tokenInfo[tokens[i]].balance += tokenAmounts[i];
            }
        }
        
        // Mint basket tokens
        _mint(msg.sender, basketAmount);
        
        emit Mint(msg.sender, basketAmount, tokenAmounts);
    }

    /**
     * @notice Burns basket tokens and withdraws underlying assets
     * @param params Burn parameters including amounts and slippage protection
     * @return tokenAmounts Amounts of underlying tokens withdrawn
     */
    function burn(BurnParams calldata params) 
        external 
        nonReentrant 
        whenNotPaused 
        whenNotRebalancing
        validDeadline(params.deadline)
        returns (uint256[] memory tokenAmounts) 
    {
        if (params.basketAmount == 0 || params.basketAmount > balanceOf(msg.sender)) {
            revert InsufficientBalance();
        }
        
        // Calculate token amounts to withdraw
        tokenAmounts = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenAmounts[i] = (tokenInfo[tokens[i]].balance * params.basketAmount) / totalSupply();
            if (tokenAmounts[i] < params.minTokenAmounts[i]) {
                revert SlippageExceeded();
            }
        }
        
        // Burn basket tokens
        _burn(msg.sender, params.basketAmount);
        
        // Transfer tokens to user
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokenAmounts[i] > 0) {
                tokenInfo[tokens[i]].balance -= tokenAmounts[i];
                IERC20(tokens[i]).safeTransfer(msg.sender, tokenAmounts[i]);
            }
        }
        
        emit Burn(msg.sender, params.basketAmount, tokenAmounts);
    }

    /**
     * @notice Rebalances the basket to new target weights
     * @param newWeights New target weights in basis points
     */
    function rebalance(uint256[] calldata newWeights) 
        external 
        onlyManager 
        nonReentrant 
        whenNotPaused 
    {
        if (newWeights.length != tokens.length) revert InvalidWeights();
        
        // Validate weights sum to 100%
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < newWeights.length; i++) {
            totalWeight += newWeights[i];
        }
        if (totalWeight != BASIS_POINTS) revert InvalidWeights();
        
        _rebalancing = true;
        
        // Store old weights for event
        uint256[] memory oldWeights = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            oldWeights[i] = tokenInfo[tokens[i]].weight;
            tokenInfo[tokens[i]].weight = newWeights[i];
        }
        
        _rebalancing = false;
        
        emit Rebalance(oldWeights, newWeights);
        emit WeightsUpdated(newWeights);
    }

    /**
     * @notice Collects management fees
     */
    function collectManagementFee() external nonReentrant {
        uint256 timeElapsed = block.timestamp - lastFeeCollection;
        if (timeElapsed == 0) return;
        
        uint256 feeAmount = (totalSupply() * managementFee * timeElapsed) / 
                           (BASIS_POINTS * SECONDS_PER_YEAR);
        
        if (feeAmount > 0) {
            _mint(manager, feeAmount);
            lastFeeCollection = block.timestamp;
            emit ManagementFeeCollected(feeAmount);
        }
    }

    /**
     * @notice Pauses the contract
     */
    function pause() external onlyFactory {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyFactory {
        _unpause();
    }

    /**
     * @notice Emergency withdraw of tokens
     * @param token Token address to withdraw
     */
    function emergencyWithdraw(address token) external onlyManager whenPaused {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).safeTransfer(manager, balance);
            emit EmergencyWithdraw(token, balance);
        }
    }

    // View functions
    function getTokens() external view returns (address[] memory) {
        return tokens;
    }

    function getWeights() external view returns (uint256[] memory) {
        uint256[] memory weights = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            weights[i] = tokenInfo[tokens[i]].weight;
        }
        return weights;
    }

    function getTokenInfo(address token) external view returns (TokenInfo memory) {
        return tokenInfo[token];
    }

    function getBasketValue() public view returns (uint256) {
        uint256 totalValue = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            // In a real implementation, this would use price oracles
            // For now, assume 1:1 with ETH for simplicity
            totalValue += tokenInfo[tokens[i]].balance;
        }
        return totalValue;
    }

    function getMintAmount(uint256 ethAmount) 
        external 
        view 
        returns (uint256 basketAmount, uint256[] memory tokenAmounts) 
    {
        if (totalSupply() == 0) {
            basketAmount = ethAmount;
            tokenAmounts = new uint256[](tokens.length);
            for (uint256 i = 0; i < tokens.length; i++) {
                tokenAmounts[i] = (ethAmount * tokenInfo[tokens[i]].weight) / BASIS_POINTS;
            }
        } else {
            uint256 totalValue = getBasketValue();
            basketAmount = (ethAmount * totalSupply()) / totalValue;
            tokenAmounts = new uint256[](tokens.length);
            for (uint256 i = 0; i < tokens.length; i++) {
                tokenAmounts[i] = (tokenInfo[tokens[i]].balance * basketAmount) / totalSupply();
            }
        }
    }

    function getBurnAmount(uint256 basketAmount) 
        external 
        view 
        returns (uint256[] memory tokenAmounts) 
    {
        tokenAmounts = new uint256[](tokens.length);
        if (totalSupply() > 0) {
            for (uint256 i = 0; i < tokens.length; i++) {
                tokenAmounts[i] = (tokenInfo[tokens[i]].balance * basketAmount) / totalSupply();
            }
        }
    }

    function isPaused() external view returns (bool) {
        return paused();
    }
}