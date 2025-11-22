# Configuration
OWNER := Tutellus
SHELL := /bin/sh
.DEFAULT_GOAL := help

# Environment variables
export DEBUG ?= tutellus:*
BUILD ?=

# Phony targets
.PHONY: help install clean phoenix dev build lint format typecheck

##@ Help

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Dependencies

install: ## Install the dependencies
	pnpm install --no-frozen-lockfile

clean: ## Remove all artifacts
	rm -Rf node_modules pnpm-lock.yaml .turbo dist
	rm -Rf packages/*/node_modules packages/*/dist packages/*/.turbo
	rm -Rf apps/*/node_modules apps/*/dist apps/*/.turbo

phoenix: ## Clean and reinstall everything
	make clean
	make install

##@ Development

dev: ## Start development mode
	turbo dev

build: ## Build the application
	turbo build

lint: ## Run the linter
	turbo lint

format: ## Run the formatter
	turbo format

typecheck: ## Run the type checker
	turbo typecheck

