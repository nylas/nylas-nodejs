# Nylas Node.js SDK - Development Makefile
# This Makefile provides shortcuts for common development tasks
# Run `make help` to see all available commands

.PHONY: help install build build-esm build-cjs clean test test-watch test-single test-coverage lint lint-fix format format-check docs typecheck ci pre-commit new-resource

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

#==============================================================================
# Help
#==============================================================================

help: ## Show this help message
	@echo "$(CYAN)Nylas Node.js SDK - Development Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Usage:$(RESET) make [target]"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Examples:$(RESET)"
	@echo "  make test-single FILE=tests/resources/calendars.spec.ts"
	@echo "  make new-resource NAME=widgets"

#==============================================================================
# Installation
#==============================================================================

install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	npm install

reinstall: clean-deps install ## Clean and reinstall dependencies

clean-deps: ## Remove node_modules
	@echo "$(YELLOW)Removing node_modules...$(RESET)"
	rm -rf node_modules

#==============================================================================
# Building
#==============================================================================

build: ## Build both ESM and CJS outputs
	@echo "$(GREEN)Building SDK...$(RESET)"
	npm run build

build-esm: ## Build ESM output only
	@echo "$(GREEN)Building ESM...$(RESET)"
	npm run build-esm

build-cjs: ## Build CJS output only
	@echo "$(GREEN)Building CJS...$(RESET)"
	npm run build-cjs

clean: ## Remove build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	rm -rf lib docs

rebuild: clean build ## Clean and rebuild

#==============================================================================
# Testing
#==============================================================================

test: ## Run all tests with coverage
	@echo "$(GREEN)Running tests...$(RESET)"
	npm test

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(RESET)"
	npm test -- --watch

test-single: ## Run a single test file (use FILE=path/to/test.spec.ts)
	@echo "$(GREEN)Running test: $(FILE)$(RESET)"
	npm test -- $(FILE)

test-coverage: ## Run tests with detailed coverage report
	@echo "$(GREEN)Running tests with coverage...$(RESET)"
	npm run test:coverage

test-verbose: ## Run tests with verbose output
	@echo "$(GREEN)Running tests (verbose)...$(RESET)"
	npm test -- --verbose

test-resource: ## Run tests for a specific resource (use NAME=calendars)
	@echo "$(GREEN)Running tests for resource: $(NAME)$(RESET)"
	npm test -- tests/resources/$(NAME).spec.ts

#==============================================================================
# Linting & Formatting
#==============================================================================

lint: ## Run ESLint
	@echo "$(GREEN)Running ESLint...$(RESET)"
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	@echo "$(GREEN)Running ESLint with auto-fix...$(RESET)"
	npm run lint:fix

format: ## Format code with Prettier
	@echo "$(GREEN)Formatting code...$(RESET)"
	npm run lint:prettier

format-check: ## Check code formatting
	@echo "$(GREEN)Checking code formatting...$(RESET)"
	npm run lint:prettier:check

#==============================================================================
# Type Checking
#==============================================================================

typecheck: ## Run TypeScript type checking
	@echo "$(GREEN)Running TypeScript type check...$(RESET)"
	npx tsc --noEmit

typecheck-watch: ## Run TypeScript type checking in watch mode
	@echo "$(GREEN)Running TypeScript type check (watch mode)...$(RESET)"
	npx tsc --noEmit --watch

#==============================================================================
# Documentation
#==============================================================================

docs: ## Generate TypeDoc documentation
	@echo "$(GREEN)Generating documentation...$(RESET)"
	npm run build:docs

docs-serve: docs ## Generate and serve documentation
	@echo "$(GREEN)Serving documentation on http://localhost:8080...$(RESET)"
	cd docs && npx http-server -p 8080

#==============================================================================
# CI/CD
#==============================================================================

ci: lint-fix format-check test ## Run full CI pipeline (lint, format check, test)
	@echo "$(GREEN)CI pipeline complete!$(RESET)"

pre-commit: lint-fix format typecheck test ## Run pre-commit checks
	@echo "$(GREEN)Pre-commit checks complete!$(RESET)"

#==============================================================================
# Development Helpers
#==============================================================================

new-resource: ## Create scaffolding for a new resource (use NAME=resourceName)
ifndef NAME
	@echo "$(RED)Error: NAME is required. Usage: make new-resource NAME=widgets$(RESET)"
	@exit 1
endif
	@echo "$(GREEN)Creating scaffolding for resource: $(NAME)$(RESET)"
	@echo "$(YELLOW)Please copy and customize these templates:$(RESET)"
	@echo "  1. .claude/shared/model-template.ts -> src/models/$(NAME).ts"
	@echo "  2. .claude/shared/resource-template.ts -> src/resources/$(NAME).ts"
	@echo "  3. .claude/shared/test-template.spec.ts -> tests/resources/$(NAME).spec.ts"
	@echo ""
	@echo "$(YELLOW)Then update:$(RESET)"
	@echo "  4. Add export to src/models/index.ts"
	@echo "  5. Import and register in src/nylas.ts"

link: build ## Build and link for local development
	@echo "$(GREEN)Linking package for local development...$(RESET)"
	npm link

unlink: ## Unlink the local package
	@echo "$(YELLOW)Unlinking package...$(RESET)"
	npm unlink

#==============================================================================
# Version Management
#==============================================================================

version-patch: ## Bump patch version
	@echo "$(GREEN)Bumping patch version...$(RESET)"
	npm version patch

version-minor: ## Bump minor version
	@echo "$(GREEN)Bumping minor version...$(RESET)"
	npm version minor

version-major: ## Bump major version
	@echo "$(GREEN)Bumping major version...$(RESET)"
	npm version major

#==============================================================================
# Quick Shortcuts
#==============================================================================

t: test ## Alias for test
w: test-watch ## Alias for test-watch
l: lint-fix ## Alias for lint-fix
f: format ## Alias for format
b: build ## Alias for build
c: ci ## Alias for ci
