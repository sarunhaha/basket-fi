# Basket.fi Smart Contracts Makefile

# Load environment variables
include .env
export

# Default target
.PHONY: help
help:
	@echo "Basket.fi Smart Contracts"
	@echo ""
	@echo "Available commands:"
	@echo "  install     Install dependencies"
	@echo "  build       Compile contracts"
	@echo "  test        Run tests"
	@echo "  coverage    Generate coverage report"
	@echo "  deploy      Deploy to testnet"
	@echo "  verify      Verify contracts"
	@echo "  clean       Clean build artifacts"
	@echo "  security    Run security analysis"

# Install dependencies
.PHONY: install
install:
	forge install OpenZeppelin/openzeppelin-contracts
	forge install foundry-rs/forge-std

# Build contracts
.PHONY: build
build:
	forge build

# Run tests
.PHONY: test
test:
	forge test -vvv

# Run tests with gas reporting
.PHONY: test-gas
test-gas:
	forge test --gas-report

# Run fuzz tests
.PHONY: fuzz
fuzz:
	forge test --fuzz-runs 10000

# Generate coverage report
.PHONY: coverage
coverage:
	forge coverage --report lcov
	genhtml lcov.info -o coverage/

# Deploy to testnet
.PHONY: deploy
deploy:
	forge script script/Deploy.s.sol --rpc-url $(MONAD_TESTNET_RPC) --broadcast --verify

# Deploy factory only
.PHONY: deploy-factory
deploy-factory:
	forge script script/DeployBasketFactory.s.sol --rpc-url $(MONAD_TESTNET_RPC) --broadcast

# Verify contracts
.PHONY: verify
verify:
	forge verify-contract --chain-id 1 --num-of-optimizations 200 --constructor-args $(CONSTRUCTOR_ARGS) $(CONTRACT_ADDRESS) $(CONTRACT_NAME)

# Clean build artifacts
.PHONY: clean
clean:
	forge clean
	rm -rf coverage/
	rm -f lcov.info

# Security analysis
.PHONY: security
security:
	slither . --config-file slither.config.json
	@echo "Security analysis complete. Check slither-report.json"

# Format code
.PHONY: format
format:
	forge fmt

# Lint code
.PHONY: lint
lint:
	forge fmt --check

# Run local node for testing
.PHONY: node
node:
	anvil --fork-url $(MONAD_TESTNET_RPC)

# Generate ABI files
.PHONY: abi
abi:
	forge build
	jq '.abi' out/BasketFactory.sol/BasketFactory.json > abi/BasketFactory.json
	jq '.abi' out/BasketToken.sol/BasketToken.json > abi/BasketToken.json
	jq '.abi' out/Rebalancer.sol/Rebalancer.json > abi/Rebalancer.json

# Run all checks (CI)
.PHONY: ci
ci: build lint test coverage security
	@echo "All CI checks passed!"

# Development setup
.PHONY: setup
setup: install build test
	@echo "Development environment ready!"