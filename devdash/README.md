# DevDash - Developer Workspace

DevDash is an all-in-one coding environment for developers, featuring:

-   AI Assistant powered by Claude
-   Stack Overflow Search
-   Coding Challenges that can be run and executed against test cases

## Design & Architecture

This project is built with a modern, decoupled architecture, separating the frontend and backend concerns. This allowed for independent development, deployment, and scaling of each part of the application.

### Frontend

The frontend is a modern single-page application (SPA) built with a focus on developer experience, performance, and maintainability.

-   **Framework & Language:** Built with **React** and **TypeScript**. This choice provides a component-based architecture with static typing, which is enables building maintainable and scalable user interfaces. **Vite** is used as the build tool for its fast development server and optimized build process.
-   **Styling:** Styled using **Tailwind CSS** and **shadcn/ui**. This approach allowed for rapid development and easy maintenance of a consistent design system without writing custom CSS. `shadcn/ui` provides a set of accessible and composable components that are copied into the project, allowing for full ownership and customization.
-   **Deployment Architecture (S3 + CloudFront):** The frontend is deployed as a static site. The GitHub Actions pipeline builds the application and syncs the static assets to an **AWS S3 bucket**. An **AWS CloudFront** distribution sits in front of the bucket, providing a global Content Delivery Network (CDN).
    -   **Trade-off:** While this serverless architecture is highly scalable, performant, and cost-effective, it introduced some complexity during setup compared to a traditional monolithic server. It required managing a separate CI/CD pipeline and careful configuration of Cross-Origin Resource Sharing (CORS) on the backend.

### Backend

The backend is an asynchronous API designed for scalability and ease of maintenance.

-   **Framework & Language:** Built with **Python** and **FastAPI**. FastAPI was chosen for its performance (on par with NodeJS and Go) and its automatic generation of interactive API documentation (Swagger UI), which has been valuable during development and testing. **Pydantic** is used for data validation, ensuring data integrity at the API boundary.
-   **Database:** A **PostgreSQL** database is used for data persistence, managed with the **SQLAlchemy** ORM for robust and type-safe database interactions.
-   **Deployment Architecture (Docker + ECR + App Runner):** The backend is containerized using **Docker**.
    -   **Choice:** The CI/CD pipeline builds a Docker image and pushes it to **Amazon Elastic Container Registry (ECR)**. The container is then deployed on **AWS App Runner**, a fully managed serverless platform.
    -   **Trade-off:** App Runner was chosen over alternatives like ECS or EC2 because it abstracts away most of infrastructure management. It automatically handles load balancing, scaling, health checks, and deployments from the container registry. The trade-off is slightly less granular control compared to ECS/EKS, but the significant reduction in operational overhead makes it an ideal choice for this project.

## Project Structure

-   `/backend`: FastAPI Python backend
-   `/frontend`: React TypeScript frontend
-   `docker-compose.yml`: Docker services configuration for local development
-   `.github/workflows`: CI/CD pipelines for automated deployment