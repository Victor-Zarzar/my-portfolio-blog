# Makefile - My-Portfolio-Blog
DOCKER_IMAGE_NAME = my-portfolio-blog
DOCKER_CONTAINER_NAME = my-portfolio-blog
PORT = 3000
DE = docker exec -it
DL = docker logs -f
REDIS_IMAGE_NAME = redis
REDIS_CONTAINER_NAME = redis
REDIS_TAG = 8-alpine
NETWORK_NAME = my-portfolio-network
DOCKER_TAG = $(shell node -p "require('./package.json').version")

check:
	bun run check

install:
	bun install

install-e2e:
	bunx playwright install

dev: install
	bun run dev

prod: install
	bun run build && bun run start

redis-dev-server:
	redis-server

create-network:
	docker network inspect $(NETWORK_NAME) >/dev/null 2>&1 || docker network create $(NETWORK_NAME)

build:
	docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) .

redis-server: create-network
	docker run --rm -d \
		--name $(REDIS_CONTAINER_NAME) \
		--network $(NETWORK_NAME) \
		-p 6379:6379 \
		$(REDIS_IMAGE_NAME):$(REDIS_TAG)

logs-redis:
	$(DL) $(REDIS_CONTAINER_NAME)

run: build redis-server
	docker run --rm -it \
		--name $(DOCKER_CONTAINER_NAME) \
		--network $(NETWORK_NAME) \
		-p $(PORT):3000 \
		-e REDIS_URL=redis://$(REDIS_CONTAINER_NAME):6379 \
		-v $(PWD):/app \
		-v /app/node_modules \
		-v /app/.next \
		$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)

stop:
	docker stop $(DOCKER_CONTAINER_NAME) >/dev/null 2>&1 || true
	docker stop $(REDIS_CONTAINER_NAME) >/dev/null 2>&1 || true
	docker rm $(DOCKER_CONTAINER_NAME) >/dev/null 2>&1 || true
	docker rm $(REDIS_CONTAINER_NAME) >/dev/null 2>&1 || true

clean: stop
	docker rmi -f $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) >/dev/null 2>&1 || true
	docker rmi -f $(REDIS_IMAGE_NAME):$(REDIS_TAG) >/dev/null 2>&1 || true
	rm -rf node_modules .next tsconfig.tsbuildinfo playwright-report test-results >/dev/null 2>&1 || true

logs:
	$(DL) $(DOCKER_CONTAINER_NAME)

shell:
	$(DE) $(DOCKER_CONTAINER_NAME) sh

generate:
	$(DE) $(DOCKER_CONTAINER_NAME) bun db:generate

migrate:
	$(DE) $(DOCKER_CONTAINER_NAME) bun db:migrate

studio:
	bun db:studio

test-unit: build redis-server
	docker run --rm \
		--name $(DOCKER_CONTAINER_NAME)-test \
		--network $(NETWORK_NAME) \
		-e REDIS_URL=redis://$(REDIS_CONTAINER_NAME):6379 \
		-v $(PWD):/app \
		-v /app/node_modules \
		-w /app \
		$(DOCKER_IMAGE_NAME):$(DOCKER_TAG) \
		sh -c "bun install --frozen-lockfile && bun run test:unit"

test-e2e: build redis-server
	docker run --rm \
		--name $(DOCKER_CONTAINER_NAME)-test \
		--network $(NETWORK_NAME) \
		-e REDIS_URL=redis://$(REDIS_CONTAINER_NAME):6379 \
		-v $(PWD):/app \
		-v /app/node_modules \
		-w /app \
		$(DOCKER_IMAGE_NAME):$(DOCKER_TAG) \
		sh -c "bun install --frozen-lockfile && bunx playwright install --with-deps chromium webkit && bun run test:e2e"

test-integration: build redis-server
	docker run --rm \
		--name $(DOCKER_CONTAINER_NAME)-test \
		--network $(NETWORK_NAME) \
		-e REDIS_URL=redis://$(REDIS_CONTAINER_NAME):6379 \
		-v $(PWD):/app \
		-v /app/node_modules \
		-w /app \
		$(DOCKER_IMAGE_NAME):$(DOCKER_TAG) \
		sh -c "bun install --frozen-lockfile && bun run test:integration"

help:
	@echo ""
	@echo "$(DOCKER_IMAGE_NAME) v$(DOCKER_TAG)"
	@echo "──────────────────────────────────────────────"
	@echo ""
	@echo "Local Commands:"
	@echo "  make install            Install dependencies using bun"
	@echo "  make install-e2e        Install Playwright dependencies"
	@echo "  make check              Run typecheck, lint, and typegen"
	@echo "  make dev                Run the app locally in development mode"
	@echo "  make redis-dev-server   Run the local Redis server"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod               Run the app in production mode (Test local)"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make build              Build the Docker image"
	@echo "  make run                Run the Docker container"
	@echo "  make generate           Generate database schema"
	@echo "  make migrate            Run database migrations"
	@echo "  make studio             Open Drizzle Studio"
	@echo "  make stop               Stop and remove the container"
	@echo "  make test-unit          Run the automated tests Units (Isolated Docker container)"
	@echo "  make test-e2e           Run the automated tests E2E (Isolated Docker container)"
	@echo "  make test-integration   Run the automated tests Integration (Isolated Docker container)"
	@echo "  make clean              Remove image and clean environment"
	@echo "  make logs               Show container logs"
	@echo "  make shell              Access container shell"
	@echo "  make redis-server       Run Redis server"
	@echo "  make logs-redis         Show Redis logs"
	@echo ""
