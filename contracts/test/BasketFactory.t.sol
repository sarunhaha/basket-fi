// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/BasketFactory.sol";
import "../src/BasketToken.sol";
import "./mocks/MockERC20.sol";

contract BasketFactoryTest is Test {
    BasketFactory public factory;
    MockERC20 public token1;
    MockERC20 public token2;
    MockERC20 public token3;
    
    address public owner = address(0x1);
    address public feeRecipient = address(0x2);
    address public user = address(0x3);
    
    uint256 public constant CREATION_FEE = 0.01 ether;
    
    event BasketCreated(
        address indexed basket,
        address indexed creator,
        string name,
        string symbol,
        address[] tokens,
        uint256[] weights
    );

    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy factory
        factory = new BasketFactory(CREATION_FEE, feeRecipient);
        
        // Deploy mock tokens
        token1 = new MockERC20("Token1", "TK1", 18);
        token2 = new MockERC20("Token2", "TK2", 18);
        token3 = new MockERC20("Token3", "TK3", 18);
        
        vm.stopPrank();
        
        // Fund user
        vm.deal(user, 10 ether);
    }

    function testCreateBasket() public {
        vm.startPrank(user);
        
        // Prepare basket config
        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token2);
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = 6000; // 60%
        weights[1] = 4000; // 40%
        
        IBasketFactory.BasketConfig memory config = IBasketFactory.BasketConfig({
            name: "Test Basket",
            symbol: "TBASKET",
            tokens: tokens,
            weights: weights,
            managementFee: 200, // 2%
            isPublic: true
        });
        
        // Expect event
        vm.expectEmit(true, true, false, true);
        emit BasketCreated(
            address(0), // Will be filled by actual address
            user,
            "Test Basket",
            "TBASKET",
            tokens,
            weights
        );
        
        // Create basket
        address basket = factory.createBasket{value: CREATION_FEE}(config);
        
        // Verify basket creation
        assertTrue(factory.isBasketValid(basket));
        assertEq(factory.getBasketCount(), 1);
        assertEq(factory.getBasket(0), basket);
        
        // Verify basket info
        IBasketFactory.BasketInfo memory info = factory.getBasketInfo(basket);
        assertEq(info.creator, user);
        assertEq(info.name, "Test Basket");
        assertEq(info.symbol, "TBASKET");
        assertFalse(info.isPaused);
        
        // Verify fee transfer
        assertEq(feeRecipient.balance, CREATION_FEE);
        
        vm.stopPrank();
    }

    function testCreateBasketInsufficientFee() public {
        vm.startPrank(user);
        
        address[] memory tokens = new address[](1);
        tokens[0] = address(token1);
        
        uint256[] memory weights = new uint256[](1);
        weights[0] = 10000;
        
        IBasketFactory.BasketConfig memory config = IBasketFactory.BasketConfig({
            name: "Test Basket",
            symbol: "TBASKET",
            tokens: tokens,
            weights: weights,
            managementFee: 200,
            isPublic: true
        });
        
        // Should revert with insufficient fee
        vm.expectRevert(IBasketFactory.InvalidFee.selector);
        factory.createBasket{value: CREATION_FEE - 1}(config);
        
        vm.stopPrank();
    }

    function testCreateBasketInvalidWeights() public {
        vm.startPrank(user);
        
        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token2);
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = 6000;
        weights[1] = 3000; // Total = 9000, not 10000
        
        IBasketFactory.BasketConfig memory config = IBasketFactory.BasketConfig({
            name: "Test Basket",
            symbol: "TBASKET",
            tokens: tokens,
            weights: weights,
            managementFee: 200,
            isPublic: true
        });
        
        vm.expectRevert(IBasketFactory.WeightsSumNotHundred.selector);
        factory.createBasket{value: CREATION_FEE}(config);
        
        vm.stopPrank();
    }

    function testCreateBasketDuplicateTokens() public {
        vm.startPrank(user);
        
        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token1); // Duplicate
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = 6000;
        weights[1] = 4000;
        
        IBasketFactory.BasketConfig memory config = IBasketFactory.BasketConfig({
            name: "Test Basket",
            symbol: "TBASKET",
            tokens: tokens,
            weights: weights,
            managementFee: 200,
            isPublic: true
        });
        
        vm.expectRevert(IBasketFactory.TokenAlreadyExists.selector);
        factory.createBasket{value: CREATION_FEE}(config);
        
        vm.stopPrank();
    }

    function testPauseBasket() public {
        // Create basket first
        address basket = _createTestBasket();
        
        vm.startPrank(user);
        
        // Pause basket
        factory.pauseBasket(basket);
        
        // Verify basket is paused
        assertTrue(BasketToken(basket).isPaused());
        
        IBasketFactory.BasketInfo memory info = factory.getBasketInfo(basket);
        assertTrue(info.isPaused);
        
        vm.stopPrank();
    }

    function testUnpauseBasket() public {
        // Create and pause basket
        address basket = _createTestBasket();
        
        vm.startPrank(user);
        factory.pauseBasket(basket);
        
        // Unpause basket
        factory.unpauseBasket(basket);
        
        // Verify basket is unpaused
        assertFalse(BasketToken(basket).isPaused());
        
        IBasketFactory.BasketInfo memory info = factory.getBasketInfo(basket);
        assertFalse(info.isPaused);
        
        vm.stopPrank();
    }

    function testSetCreationFee() public {
        vm.startPrank(owner);
        
        uint256 newFee = 0.02 ether;
        factory.setCreationFee(newFee);
        
        assertEq(factory.getCreationFee(), newFee);
        
        vm.stopPrank();
    }

    function testSetFeeRecipient() public {
        vm.startPrank(owner);
        
        address newRecipient = address(0x4);
        factory.setFeeRecipient(newRecipient);
        
        assertEq(factory.getFeeRecipient(), newRecipient);
        
        vm.stopPrank();
    }

    function testSetFeeRecipientZeroAddress() public {
        vm.startPrank(owner);
        
        vm.expectRevert(IBasketFactory.InvalidFeeRecipient.selector);
        factory.setFeeRecipient(address(0));
        
        vm.stopPrank();
    }

    function testEmergencyPause() public {
        vm.startPrank(owner);
        
        factory.emergencyPause();
        
        vm.stopPrank();
        
        // Should not be able to create baskets when paused
        vm.startPrank(user);
        
        address[] memory tokens = new address[](1);
        tokens[0] = address(token1);
        
        uint256[] memory weights = new uint256[](1);
        weights[0] = 10000;
        
        IBasketFactory.BasketConfig memory config = IBasketFactory.BasketConfig({
            name: "Test Basket",
            symbol: "TBASKET",
            tokens: tokens,
            weights: weights,
            managementFee: 200,
            isPublic: true
        });
        
        vm.expectRevert("Pausable: paused");
        factory.createBasket{value: CREATION_FEE}(config);
        
        vm.stopPrank();
    }

    function testGetBasketsByCreator() public {
        // Create multiple baskets
        address basket1 = _createTestBasket();
        address basket2 = _createTestBasket();
        
        address[] memory userBaskets = factory.getBasketsByCreator(user);
        assertEq(userBaskets.length, 2);
        assertEq(userBaskets[0], basket1);
        assertEq(userBaskets[1], basket2);
    }

    function testUnauthorizedPause() public {
        address basket = _createTestBasket();
        
        vm.startPrank(address(0x5)); // Different user
        
        vm.expectRevert(IBasketFactory.Unauthorized.selector);
        factory.pauseBasket(basket);
        
        vm.stopPrank();
    }

    // Fuzz tests
    function testFuzzCreateBasketWeights(uint256 weight1, uint256 weight2) public {
        vm.assume(weight1 > 0 && weight2 > 0);
        vm.assume(weight1 + weight2 == 10000);
        vm.assume(weight1 >= 100 && weight2 >= 100); // MIN_WEIGHT
        
        vm.startPrank(user);
        
        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token2);
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = weight1;
        weights[1] = weight2;
        
        IBasketFactory.BasketConfig memory config = IBasketFactory.BasketConfig({
            name: "Fuzz Basket",
            symbol: "FUZZ",
            tokens: tokens,
            weights: weights,
            managementFee: 200,
            isPublic: true
        });
        
        address basket = factory.createBasket{value: CREATION_FEE}(config);
        assertTrue(factory.isBasketValid(basket));
        
        vm.stopPrank();
    }

    function testFuzzCreationFee(uint256 fee) public {
        vm.assume(fee <= 1 ether); // Reasonable upper bound
        
        vm.startPrank(owner);
        factory.setCreationFee(fee);
        vm.stopPrank();
        
        assertEq(factory.getCreationFee(), fee);
    }

    // Helper functions
    function _createTestBasket() internal returns (address) {
        vm.startPrank(user);
        
        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token2);
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = 6000;
        weights[1] = 4000;
        
        IBasketFactory.BasketConfig memory config = IBasketFactory.BasketConfig({
            name: "Test Basket",
            symbol: "TBASKET",
            tokens: tokens,
            weights: weights,
            managementFee: 200,
            isPublic: true
        });
        
        address basket = factory.createBasket{value: CREATION_FEE}(config);
        
        vm.stopPrank();
        
        return basket;
    }
}