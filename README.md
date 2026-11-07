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
    -   **Trade-off:** While this serverless architecture is highly scalable, performant, and cost-effective, it introduced some complexity during setup compared to a traditional monolithic server, including a separate CI/CD pipeline. The same CloudFront distribution also routes `/api/v1/*` to the backend, so the browser calls the API on its own origin and CORS is not involved in production.

### Backend

The backend is an asynchronous API designed for scalability and ease of maintenance.

-   **Framework & Language:** Built with **Python** and **FastAPI**. FastAPI was chosen for its performance (on par with NodeJS and Go) and its automatic generation of interactive API documentation (Swagger UI), which has been valuable during development and testing. **Pydantic** is used for data validation, ensuring data integrity at the API boundary.
-   **Database:** A **PostgreSQL** database is used for data persistence, managed with the **SQLAlchemy** ORM for robust and type-safe database interactions.
-   **Deployment Architecture (Lambda + API Gateway + Neon):** The backend is a **Docker** container image, pushed to **Amazon ECR** and run on **AWS Lambda** (Sydney) behind an **API Gateway HTTP API**. CloudFront forwards `/api/v1/*` to API Gateway and adds a shared-secret header that the backend checks, so the API only answers requests that came through CloudFront. The database is **Neon** serverless Postgres, also in Sydney.
    -   **History:** The backend originally ran on App Runner with RDS. It was moved in June 2026 because those services bill per hour whether or not anyone visits. The current stack costs a few cents a month at this project's traffic.
    -   **Trade-off:** Lambda and Neon both scale to zero, which is what makes them cheap, but it means cold starts: after a quiet period the first request waits for a new Lambda container and for Neon to wake its database. SQLAlchemy's `NullPool` is used, so each request opens a fresh connection through Neon's pooler. Connections held by a container that Lambda has frozen between requests can go stale, and every container would keep its own pool, so pooling is left to Neon. The cost is a connection setup on every request, which is why the database's location matters so much (see Performance below).
-   **Performance (November 2026):** Challenges took about 2.3 s to load warm and 8 s after a quiet period. The main cause was the database sitting in the US while Lambda ran in Sydney, so each of a request's database round trips crossed the Pacific. Moving Neon to Sydney brought a warm request down to about 0.16 s. Challenge reads are now also cached at CloudFront for a day, so most visitors get them in under 0.1 s without waking Lambda or the database. The reasoning for each change, and the alternatives considered, are in `OPEN_QUESTIONS_AND_CONCERNS.md`.

## Project Structure

-   `devdash/backend`: FastAPI Python backend
-   `devdash/frontend`: React TypeScript frontend
-   `.github/workflows`: CI (tests on pull requests) and deployment pipelines; a push to `main` deploys
-   `OPEN_QUESTIONS_AND_CONCERNS.md`: design decisions, fixes and their reasoning, and open questions