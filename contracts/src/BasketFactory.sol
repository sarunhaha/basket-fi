// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IBasketFactory.sol";
import "./BasketToken.sol";

/**
 * @title BasketFactory
 * @notice Factory contract for creating and managing basket tokens
 * @dev Creates BasketToken instances and manages protocol-wide settings
 */
contract BasketFactory is IBasketFactory, Ownable, ReentrancyGuard, Pausable {
    using Address for address payable;

    // Constants
    uint256 public constant MAX_TOKENS = 20;
    uint256 public constant MIN_WEIGHT = 100; // 1%
    uint256 public constant MAX_FEE = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000;

    // State variables
    address[] public baskets;
    mapping(address => bool) public isBasket;
    mapping(address => address[]) public basketsByCreator;
    mapping(address => BasketInfo) public basketInfo;
    
    uint256 public creationFee;
    address public feeRecipient;
    
    // Modifiers
    modifier validBasket(address basket) {
        if (!isBasket[basket]) revert BasketNotFound();
        _;
    }

    modifier onlyBasketManager(address basket) {
        if (BasketToken(basket).manager() != msg.sender) revert Unauthorized();
        _;
    }

    constructor(uint256 _creationFee, address _feeRecipient) {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        
        creationFee = _creationFee;
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Creates a new basket token
     * @param config Basket configuration parameters
     * @return basket Address of the created basket token
     */
    function createBasket(BasketConfig calldata config) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (address basket) 
    {
        // Validate creation fee
        if (msg.value < creationFee) revert InvalidFee();
        
        // Validate configuration
        _validateBasketConfig(config);
        
        // Create basket token
        basket = address(new BasketToken(
            config.name,
            config.symbol,
            config.tokens,
            config.weights,
            config.managementFee,
            msg.sender,
            address(this)
        ));
        
        // Update state
        baskets.push(basket);
        isBasket[basket] = true;
        basketsByCreator[msg.sender].push(basket);
        
        basketInfo[basket] = BasketInfo({
            basket: basket,
            creator: msg.sender,
            name: config.name,
            symbol: config.symbol,
            totalSupply: 0,
            totalValue: 0,
            isPaused: false,
            createdAt: block.timestamp
        });
        
        // Transfer creation fee
        if (msg.value > 0) {
            payable(feeRecipient).sendValue(msg.value);
        }
        
        emit BasketCreated(
            basket,
            msg.sender,
            config.name,
            config.symbol,
            config.tokens,
            config.weights
        );
    }

    /**
     * @notice Pauses a basket token
     * @param basket Address of the basket to pause
     */
    function pauseBasket(address basket) 
        external 
        validBasket(basket) 
        onlyBasketManager(basket) 
    {
        BasketToken(basket).pause();
        basketInfo[basket].isPaused = true;
        emit BasketPaused(basket);
    }

    /**
     * @notice Unpauses a basket token
     * @param basket Address of the basket to unpause
     */
    function unpauseBasket(address basket) 
        external 
        validBasket(basket) 
        onlyBasketManager(basket) 
    {
        BasketToken(basket).unpause();
        basketInfo[basket].isPaused = false;
        emit BasketUnpaused(basket);
    }

    /**
     * @notice Sets the creation fee
     * @param fee New creation fee in wei
     */
    function setCreationFee(uint256 fee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = fee;
        emit FeeUpdated(oldFee, fee);
    }

    /**
     * @notice Sets the fee recipient
     * @param recipient New fee recipient address
     */
    function setFeeRecipient(address recipient) external onlyOwner {
        if (recipient == address(0)) revert InvalidFeeRecipient();
        
        address oldRecipient = feeRecipient;
        feeRecipient = recipient;
        emit FeeRecipientUpdated(oldRecipient, recipient);
    }

    /**
     * @notice Emergency pause all operations
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Emergency unpause all operations
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getBasket(uint256 basketId) external view returns (address) {
        return basketId < baskets.length ? baskets[basketId] : address(0);
    }

    function getBasketInfo(address basket) external view returns (BasketInfo memory) {
        return basketInfo[basket];
    }

    function getBasketCount() external view returns (uint256) {
        return baskets.length;
    }

    function getBasketsByCreator(address creator) external view returns (address[] memory) {
        return basketsByCreator[creator];
    }

    function isBasketValid(address basket) external view returns (bool) {
        return isBasket[basket];
    }

    function getCreationFee() external view returns (uint256) {
        return creationFee;
    }

    function getFeeRecipient() external view returns (address) {
        return feeRecipient;
    }

    // Internal functions
    function _validateBasketConfig(BasketConfig calldata config) internal pure {
        // Validate token count
        if (config.tokens.length == 0 || config.tokens.length > MAX_TOKENS) {
            revert InvalidTokenCount();
        }
        
        // Validate weights array length
        if (config.tokens.length != config.weights.length) {
            revert InvalidWeights();
        }
        
        // Validate weights sum and individual weights
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < config.weights.length; i++) {
            if (config.weights[i] < MIN_WEIGHT) revert InvalidWeights();
            totalWeight += config.weights[i];
            
            // Check for duplicate tokens
            for (uint256 j = i + 1; j < config.tokens.length; j++) {
                if (config.tokens[i] == config.tokens[j]) {
                    revert TokenAlreadyExists();
                }
            }
        }
        
        if (totalWeight != BASIS_POINTS) revert WeightsSumNotHundred();
        
        // Validate management fee
        if (config.managementFee > MAX_FEE) revert InvalidFee();
    }
}