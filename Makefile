.PHONY: dev dev-backend dev-frontend migrate studio seed docker-up docker-down install

# Install all dependencies
install:
	cd backend && npm install
	cd frontend && npm install

# Run both backend and frontend in development
dev:
	@echo "Starting backend and frontend..."
	$(MAKE) dev-backend &
	$(MAKE) dev-frontend

# Run backend only
dev-backend:
	cd backend && npm run start:dev

# Run frontend only
dev-frontend:
	cd frontend && npm run dev

# Run Prisma migration
migrate:
	cd backend && npx prisma migrate dev

# Open Prisma Studio
studio:
	cd backend && npx prisma studio

# Seed the database
seed:
	cd backend && npx prisma db seed

# Generate Prisma client
generate:
	cd backend && npx prisma generate

# Docker Compose up
docker-up:
	docker-compose up -d

# Docker Compose down
docker-down:
	docker-compose down

# Docker Compose up with rebuild
docker-rebuild:
	docker-compose up -d --build

# Run backend tests
test:
	cd backend && npm run test

# Run backend e2e tests
test-e2e:
	cd backend && npm run test:e2e
