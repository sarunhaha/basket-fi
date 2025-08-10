// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/BasketToken.sol";
import "../src/BasketFactory.sol";
import "./mocks/MockERC20.sol";

contract BasketTokenTest is Test {
    BasketToken public basket;
    BasketFactory public factory;
    MockERC20 public token1;
    MockERC20 public token2;
    
    address public manager = address(0x1);
    address public user = address(0x2);
    address public factoryAddr = address(0x3);
    
    uint256 public constant INITIAL_SUPPLY = 1000 ether;
    
    event Mint(address indexed to, uint256 amount, uint256[] tokenAmounts);
    event Burn(address indexed from, uint256 amount, uint256[] tokenAmounts);

    function setUp() public {
        // Deploy mock tokens
        token1 = new MockERC20("Token1", "TK1", 18);
        token2 = new MockERC20("Token2", "TK2", 18);
        
        // Mint tokens to user
        token1.mint(user, INITIAL_SUPPLY);
        token2.mint(user, INITIAL_SUPPLY);
        
        // Setup basket parameters
        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token2);
        
        uint256[] memory weights = new uint256[](2);
        weights[0] = 6000; // 60%
        weights[1] = 4000; // 40%
        
        // Deploy basket token
        basket = new BasketToken(
            "Test Basket",
            "TBASKET",
            tokens,
            weights,
            200, // 2% management fee
            manager,
            factoryAddr
        );
        
        // Fund user with ETH
        vm.deal(user, 10 ether);
    }

    function testInitialState() public {
        assertEq(basket.name(), "Test Basket");
        assertEq(basket.symbol(), "TBASKET");
        assertEq(basket.manager(), manager);
        assertEq(basket.factory(), factoryAddr);
        assertEq(basket.managementFee(), 200);
        
        address[] memory tokens = basket.getTokens();
        assertEq(tokens.length, 2);
        assertEq(tokens[0], address(token1));
        assertEq(tokens[1], address(token2));
        
        uint256[] memory weights = basket.getWeights();
        assertEq(weights.length, 2);
        assertEq(weights[0], 6000);
        assertEq(weights[1], 4000);
    }

    function testFirstMint() public {
        vm.startPrank(user);
        
        // Approve tokens
        token1.approve(address(basket), INITIAL_SUPPLY);
        token2.approve(address(basket), INITIAL_SUPPLY);
        
        // Prepare mint parameters
        uint256 ethAmount = 1 ether;
        uint256[] memory maxTokenAmounts = new uint256[](2);
        maxTokenAmounts[0] = 0.6 ether; // 60% of ETH amount
        maxTokenAmounts[1] = 0.4 ether; // 40% of ETH amount
        
        IBasketToken.MintParams memory params = IBasketToken.MintParams({
            basketAmount: ethAmount,
            maxTokenAmounts: maxTokenAmounts,
            deadline: block.timestamp + 1 hours
        });
        
        // Calculate expected token amounts
        uint256[] memory expectedAmounts = new uint256[](2);
        expectedAmounts[0] = (ethAmount * 6000) / 10000;
        expectedAmounts[1] = (ethAmount * 4000) / 10000;
        
        // Expect mint event
        vm.expectEmit(true, false, false, true);
        emit Mint(user, ethAmount, expectedAmounts);
        
        // Mint basket tokens
        uint256 basketAmount = basket.mint{value: ethAmount}(params);
        
        // Verify results
        assertEq(basketAmount, ethAmount);
        assertEq(basket.balanceOf(user), ethAmount);
        assertEq(basket.totalSupply(), ethAmount);
        
        // Verify token transfers
        assertEq(token1.balanceOf(address(basket)), expectedAmounts[0]);
        assertEq(token2.balanceOf(address(basket)), expectedAmounts[1]);
        
        vm.stopPrank();
    }

    function testSubsequentMint() public {
        // First mint
        _performFirstMint();
        
        vm.startPrank(user);
        
        // Second mint with different amount
        uint256 basketAmount = 0.5 ether;
        uint256[] memory maxTokenAmounts = new uint256[](2);
        maxTokenAmounts[0] = type(uint256).max;
        maxTokenAmounts[1] = type(uint256).max;
        
        IBasketToken.MintParams memory params = IBasketToken.MintParams({
            basketAmount: basketAmount,
            maxTokenAmounts: maxTokenAmounts,
            deadline: block.timestamp + 1 hours
        });
        
        uint256 initialSupply = basket.totalSupply();
        uint256 resultAmount = basket.mint(params);
        
        // Verify proportional minting
        assertEq(resultAmount, basketAmount);
        assertEq(basket.balanceOf(user), initialSupply + basketAmount);
        
        vm.stopPrank();
    }

    function testBurn() public {
        // First mint
        _performFirstMint();
        
        vm.startPrank(user);
        
        uint256 burnAmount = 0.5 ether;
        uint256[] memory minTokenAmounts = new uint256[](2);
        minTokenAmounts[0] = 0; // Accept any amount
        minTokenAmounts[1] = 0;
        
        IBasketToken.BurnParams memory params = IBasketToken.BurnParams({
            basketAmount: burnAmount,
            minTokenAmounts: minTokenAmounts,
            deadline: block.timestamp + 1 hours
        });
        
        uint256 initialBalance = basket.balanceOf(user);
        uint256[] memory tokenAmounts = basket.burn(params);
        
        // Verify burn
        assertEq(basket.balanceOf(user), initialBalance - burnAmount);
        assertTrue(tokenAmounts[0] > 0);
        assertTrue(tokenAmounts[1] > 0);
        
        vm.stopPrank();
    }

    function testRebalance() public {
        vm.startPrank(manager);
        
        uint256[] memory newWeights = new uint256[](2);
        newWeights[0] = 5000; // 50%
        newWeights[1] = 5000; // 50%
        
        basket.rebalance(newWeights);
        
        uint256[] memory weights = basket.getWeights();
        assertEq(weights[0], 5000);
        assertEq(weights[1], 5000);
        
        vm.stopPrank();
    }

    function testRebalanceInvalidWeights() public {
        vm.startPrank(manager);
        
        uint256[] memory newWeights = new uint256[](2);
        newWeights[0] = 6000;
        newWeights[1] = 3000; // Total = 9000, not 10000
        
        vm.expectRevert(IBasketToken.InvalidWeights.selector);
        basket.rebalance(newWeights);
        
        vm.stopPrank();
    }

    function testRebalanceUnauthorized() public {
        vm.startPrank(user);
        
        uint256[] memory newWeights = new uint256[](2);
        newWeights[0] = 5000;
        newWeights[1] = 5000;
        
        vm.expectRevert(IBasketToken.OnlyManager.selector);
        basket.rebalance(newWeights);
        
        vm.stopPrank();
    }

    function testManagementFeeCollection() public {
        // First mint to have some supply
        _performFirstMint();
        
        // Fast forward time
        vm.warp(block.timestamp + 365 days);
        
        uint256 initialSupply = basket.totalSupply();
        
        // Collect fees
        basket.collectManagementFee();
        
        // Verify fee was collected
        uint256 newSupply = basket.totalSupply();
        assertTrue(newSupply > initialSupply);
        assertTrue(basket.balanceOf(manager) > 0);
    }

    function testPauseUnpause() public {
        vm.startPrank(factoryAddr);
        
        // Pause
        basket.pause();
        assertTrue(basket.isPaused());
        
        // Unpause
        basket.unpause();
        assertFalse(basket.isPaused());
        
        vm.stopPrank();
    }

    function testMintWhenPaused() public {
        vm.prank(factoryAddr);
        basket.pause();
        
        vm.startPrank(user);
        
        token1.approve(address(basket), INITIAL_SUPPLY);
        token2.approve(address(basket), INITIAL_SUPPLY);
        
        uint256[] memory maxTokenAmounts = new uint256[](2);
        maxTokenAmounts[0] = 1 ether;
        maxTokenAmounts[1] = 1 ether;
        
        IBasketToken.MintParams memory params = IBasketToken.MintParams({
            basketAmount: 1 ether,
            maxTokenAmounts: maxTokenAmounts,
            deadline: block.timestamp + 1 hours
        });
        
        vm.expectRevert("Pausable: paused");
        basket.mint{value: 1 ether}(params);
        
        vm.stopPrank();
    }

    function testSlippageProtection() public {
        vm.startPrank(user);
        
        token1.approve(address(basket), INITIAL_SUPPLY);
        token2.approve(address(basket), INITIAL_SUPPLY);
        
        // Set very low max amounts to trigger slippage protection
        uint256[] memory maxTokenAmounts = new uint256[](2);
        maxTokenAmounts[0] = 0.1 ether; // Much less than required 0.6 ether
        maxTokenAmounts[1] = 0.1 ether; // Much less than required 0.4 ether
        
        IBasketToken.MintParams memory params = IBasketToken.MintParams({
            basketAmount: 1 ether,
            maxTokenAmounts: maxTokenAmounts,
            deadline: block.timestamp + 1 hours
        });
        
        // Should revert due to slippage
        vm.expectRevert(IBasketToken.SlippageExceeded.selector);
        basket.mint{value: 1 ether}(params);
        
        vm.stopPrank();
    }

    function testDeadlineExpired() public {
        vm.startPrank(user);
        
        token1.approve(address(basket), INITIAL_SUPPLY);
        token2.approve(address(basket), INITIAL_SUPPLY);
        
        uint256[] memory maxTokenAmounts = new uint256[](2);
        maxTokenAmounts[0] = 1 ether;
        maxTokenAmounts[1] = 1 ether;
        
        IBasketToken.MintParams memory params = IBasketToken.MintParams({
            basketAmount: 1 ether,
            maxTokenAmounts: maxTokenAmounts,
            deadline: block.timestamp - 1 // Expired deadline
        });
        
        vm.expectRevert("Deadline exceeded");
        basket.mint{value: 1 ether}(params);
        
        vm.stopPrank();
    }

    function testEmergencyWithdraw() public {
        // First mint to have tokens in basket
        _performFirstMint();
        
        // Pause the contract first
        vm.prank(factoryAddr);
        basket.pause();
        
        vm.startPrank(manager);
        
        uint256 token1Balance = token1.balanceOf(address(basket));
        uint256 initialManagerBalance = token1.balanceOf(manager);
        
        basket.emergencyWithdraw(address(token1));
        
        // Verify withdrawal
        assertEq(token1.balanceOf(address(basket)), 0);
        assertEq(token1.balanceOf(manager), initialManagerBalance + token1Balance);
        
        vm.stopPrank();
    }

    // Fuzz tests
    function testFuzzMintAmount(uint256 amount) public {
        vm.assume(amount >= basket.MIN_MINT_AMOUNT() && amount <= 100 ether);
        
        vm.startPrank(user);
        
        token1.approve(address(basket), INITIAL_SUPPLY);
        token2.approve(address(basket), INITIAL_SUPPLY);
        
        uint256[] memory maxTokenAmounts = new uint256[](2);
        maxTokenAmounts[0] = type(uint256).max;
        maxTokenAmounts[1] = type(uint256).max;
        
        IBasketToken.MintParams memory params = IBasketToken.MintParams({
            basketAmount: amount,
            maxTokenAmounts: maxTokenAmounts,
            deadline: block.timestamp + 1 hours
        });
        
        vm.deal(user, amount);
        uint256 basketAmount = basket.mint{value: amount}(params);
        
        assertEq(basketAmount, amount);
        assertEq(basket.balanceOf(user), amount);
        
        vm.stopPrank();
    }

    function testFuzzRebalanceWeights(uint256 weight1) public {
        vm.assume(weight1 > 0 && weight1 < 10000);
        uint256 weight2 = 10000 - weight1;
        
        vm.startPrank(manager);
        
        uint256[] memory newWeights = new uint256[](2);
        newWeights[0] = weight1;
        newWeights[1] = weight2;
        
        basket.rebalance(newWeights);
        
        uint256[] memory weights = basket.getWeights();
        assertEq(weights[0], weight1);
        assertEq(weights[1], weight2);
        
        vm.stopPrank();
    }

    // Helper functions
    function _performFirstMint() internal {
        vm.startPrank(user);
        
        token1.approve(address(basket), INITIAL_SUPPLY);
        token2.approve(address(basket), INITIAL_SUPPLY);
        
        uint256[] memory maxTokenAmounts = new uint256[](2);
        maxTokenAmounts[0] = 1 ether;
        maxTokenAmounts[1] = 1 ether;
        
        IBasketToken.MintParams memory params = IBasketToken.MintParams({
            basketAmount: 1 ether,
            maxTokenAmounts: maxTokenAmounts,
            deadline: block.timestamp + 1 hours
        });
        
        basket.mint{value: 1 ether}(params);
        
        vm.stopPrank();
    }
}