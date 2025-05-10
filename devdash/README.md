# DevDash - Developer Workspace

DevDash is an all-in-one coding environment for developers, featuring:

- AI Assistant powered by Claude
- Stack Overflow Search
- HackerRank Challenges
- Code Playground

## Docker Setup

This project is configured to run in Docker containers, making it easy to develop and deploy.

### Prerequisites

- Docker and Docker Compose installed on your system
- Anthropic API key for the AI assistant
- Stack Exchange API key for Stack Overflow search

### Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd devdash
   ```

2. Create an environment file
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file to add your API keys
   ```bash
   # Open the .env file in your favorite editor and add your API keys
   nano .env
   ```

4. Start the Docker containers
   ```bash
   docker-compose up
   ```

5. Access the application
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Available Services

- **Frontend**: React application running on port 5173
- **Backend**: FastAPI service running on port 8000
- **Database**: PostgreSQL database running on port 5432

### Development Workflow

The Docker setup is configured for a development workflow with:

- Hot-reloading for both frontend and backend
- Volume mounting for local development
- Database persistence across container restarts

To stop the services:
```bash
docker-compose down
```

To rebuild the containers after making changes to dependencies:
```bash
docker-compose build
```

## Deployment

For production deployment, you can:

1. Build optimized container images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Push the images to a container registry (AWS ECR, Docker Hub, etc.)

3. Deploy to AWS using:
   - AWS ECS (Elastic Container Service)
   - AWS EKS (Elastic Kubernetes Service)
   - AWS EC2 instances with Docker installed

## Project Structure

- `/backend`: FastAPI Python backend
- `/frontend`: React TypeScript frontend
- `docker-compose.yml`: Docker services configuration


##THINGS TO DO
1. add a better ux for writing solutions to coding problems
2. add question body to stack overflow search
3. change chat api to free resource