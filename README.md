<h1 align="center" id="header">
    My Portfolio (Back for Front application)
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun">
  <img src="https://img.shields.io/badge/DrizzleORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Neon-000000?style=for-the-badge&logo=neon&logoColor=white" alt="Neon">
  <img src="https://img.shields.io/badge/BetterAuth-000000?style=for-the-badge" alt="Better Auth">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions">
</p>

<p align="center">
  Full-stack personal portfolio featuring a blog and admin dashboard, built with Next.js 16, 
  TypeScript, React 19, PostgreSQL (Neon), Drizzle ORM, Redis, and Better Auth — 
  with internationalization, dark mode, and secure authentication.
</p>

---

<h2 id="table-of-contents">Table of Contents</h2>

- [Tech Stack](#stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation)
- [Database](#database)
- [Neon Branch Strategy](#neon-branch-strategy)
- [Usage](#usage)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

<h2 id="stack">Tech Stack</h2>

<p>
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/HTML.svg" width="48" title="HTML5">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/TailwindCSS-Dark.svg" width="48" title="TailwindCSS">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/React-Dark.svg" width="48" title="React.js">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/TypeScript.svg" width="48" title="TypeScript">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/NextJS-Dark.svg" width="48" title="Next.js">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/Vercel-Dark.svg" width="48" title="Vercel">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/Docker.svg" width="48" title="Docker">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/Sentry.svg" width="48" title="Sentry">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/PostgreSQL-Dark.svg" width="48" title="PostgreSQL">
<img src="https://github.com/tandpfun/skill-icons/blob/main/icons/Redis-Dark.svg" width="48" title="Redis">
</p>

### Core Technologies

- **TypeScript** - Type-safe development
- **React 19** - Latest React features
- **Next.js 16** - React framework with App Router
- **Tailwind CSS v4** - Utility-first CSS framework
- **Drizzle ORM** - Type-safe ORM for PostgreSQL
- **PostgreSQL** - Serverless PostgreSQL database for blog content
- **Docker** - Optional containerized deployment (Development and Testing)

### Features & Integrations

- **Blog powered by PostgreSQL** - Articles stored and served via Neon serverless database
- **Drizzle ORM + Drizzle Kit** - Database schema management and migrations
- **Better Auth** - Authentication with session management and secure credential handling
- **Two Factor Auth** - TOTP-based 2FA via Better Auth, with QR code setup flow and backup codes support
- **Google reCAPTCHA v3** - Invisible bot protection via react-google-recaptcha-v3
- **Redis** - In-memory cache layer for session storage and performance optimization
- **Zod & React Hook Form** - Form validation and management
- **Shadcn UI** - Beautiful and accessible components
- **Dark Mode** - Theme switching with Next Themes
- **i18n** - Multi-language support (EN / PT-BR / ES) via Next Intl
- **Nodemailer** - Email functionality
- **WebHook Slack** - Slack notifications
- **Sanitize HTML** - XSS protection for user inputs
- **Rate Limiter Flexible** - API endpoint rate limiting and DDoS protection
- **Vercel Analytics** - Performance monitoring
- **Vercel Speed Insights** - Real-time performance metrics
- **Sentry** - Error tracking and performance monitoring
- **GitHub Actions** - Continuous integration and deployment
- **Argon2** - Standard secure password hashing

---

<h2 id="prerequisites">Prerequisites</h2>

Before starting, ensure you have the following installed:

- [Bun](https://bun.sh/docs) (v1 or higher) – primary runtime & package manager
- [Redis](https://redis.io) - In-memory cache layer for session storage and performance optimization
- [Docker](https://www.docker.com/) – For local containerized development (Development and Testing)
- [Git](https://git-scm.com/)

> Optional: [Node.js](https://nodejs.org/) (v22 or higher), if you prefer running the app with Node or using Node-based global tooling.

---

<h2 id="installation">Installation & Setup</h2>

### 1. Clone the Repository

```bash
git clone https://github.com/Victor-Zarzar/my-portfolio-blog
cd my-portfolio-blog
```

### 2. Open in your editor (example: Zed Editor)

```bash
zed .
```

### 3. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp .env-example .env
```

Then edit `.env` with your actual values. The `.env-example` file contains detailed comments explaining each variable and how to obtain the necessary credentials.

**Key configurations needed:**

- **SMTP**: Gmail account and [App Password](https://support.google.com/accounts/answer/185833)
- **Sentry**: DSN and authentication token from your [Sentry project](https://sentry.io/)
- **Database**: Neon PostgreSQL connection string from [Neon Console](https://neon.tech/)
- **Website URL**: Your production domain or `http://localhost:3000` for development
- **Redis URL**: Your production domain or `redis://localhost:6379` for development

> **Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

### 4. Run the Application

```bash
make redis-dev-server & make dev # Run redis server + install deps + run next dev
bun db:generate
bun db:migrate
```

Or manually with bun:

```bash
docker run --rm -d --name redis -p 6379:6379 redis:8-alpine
bun install
bun run db:generate
bun run db:migrate
bun run dev
```

Docker Container + Build (Local dev):

```bash
make run  # Starts Redis + builds image + runs container
make generate
make migrate
```

---

<h2 id="neon-branch-strategy">Neon Branch Strategy</h2>

To keep the production database safe, this project uses **Neon's branching feature** to isolate environments. The `main` branch in Neon is reserved exclusively for production and must **never** be used directly for local development or CI pipelines.

### Branch Overview

| Neon Branch   | Purpose                                    | Used by                                          |
| ------------- | ------------------------------------------ | ------------------------------------------------ |
| `main`        | Production data — read/write in production | Vercel (Production deployment)                   |
| `development` | Isolated database for local debug and CI   | Local `.env` + GitHub Actions `integration.yaml` |

### Creating the `development` Branch

1. Go to your [Neon Console](https://neon.tech/) and open your project.
2. Navigate to **Branches** → **Create Branch**.
3. Name it `development` and branch it from `main`.
4. Copy the connection string for the `development` branch.

**Local `.env`:**

```env
# Use the development branch connection string — never main
DATABASE_URL="postgresql://user:password@ep-xx.us.neon.tech/neondb?sslmode=require"
```

**GitHub Actions (`integration.yaml`):**

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** and add the same connection string:

```
DATABASE_URL=postgresql://user:password@ep-xx.aws.neon.tech/neondb?sslmode=require
```

Then reference it in `.github/workflows/integration.yaml`:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

> **Important:** The `integration.yaml` workflow must never reference the `main` branch connection string. Both local development and CI use the `development` branch to stay fully isolated from production.

### Summary

```
Neon Project
├── main          → Vercel Production only
└── development   → Local .env + GitHub Actions integration.yaml (CI tests)
```

---

<h2 id="testing">Testing</h2>

Unit and integration tests use Bun's built-in test runner with React Testing Library
and Happy DOM. End-to-end (E2E) tests use [Playwright](https://playwright.dev/) with Chromium.

### Automated (Isolated Docker container) — Recommended

```bash
make test-unit
make test-integration
make test-e2e
```

#### E2E tests in an isolated container (OS-independent)

`make test-e2e` builds a dedicated image from `Dockerfile.test`
(`oven/bun` + project dependencies + Playwright Chromium with all system libraries)
and runs the suite inside it, connected to a Redis container on the
`my-portfolio-network` Docker network.

Because the browser and every system dependency live inside the image, the
results **do not depend on your host operating system** — the same command runs
the same way on Linux, macOS and Windows, as long as Docker is available.
Nothing needs to be installed on your machine besides Docker and Make.

> **Windows note:** run `make` from **WSL2** (recommended) or Git Bash with
> Docker Desktop running. The Makefile uses `$(PWD)` and POSIX shell syntax,
> which are not available in plain `cmd`/PowerShell.

### Manual with Bun (local machine)

```bash
bun run test:unit
bun run test:integration

make install-e2e     # first time only: installs Playwright browsers locally
bun run test:e2e
```

> Local E2E runs use your host's browser installation and OS libraries, so
> results may vary between machines. Use `make test-e2e` for reproducible runs.

Add your tests in the `tests/` directory or colocate them with your components.

---

### 5. Code Quality Check

Before starting development, run the linter to ensure code quality (bunx biome check):

```bash
bun run lint              # Check for issues
bun run lint:fix          # Format errors code
bun run format            # Format code
```

### 6. Git Hooks with Lefthook

This project uses **Lefthook** to automatically run quality checks before commits and pushes, keeping the local development workflow consistent and preventing broken code from being pushed.

The hooks are configured in `lefthook.yml`:

- **Pre-commit** — runs type checking, linting, unit tests, and integration tests.
- **Pre-push** — runs the full E2E test suite inside an isolated Docker container, ensuring consistent results across operating systems.

Hooks are installed automatically with the project dependencies and run as part of the normal Git workflow. No manual test command is required before committing or pushing.

---

<h2 id="database">Database</h2>

The blog content is stored in a **PostgreSQL database** via [Neon](https://neon.tech/) serverless infrastructure, managed through **Drizzle ORM**.

### Available DB Commands

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `bun run db:generate` | Generate SQL migrations from schema      |
| `bun run db:migrate`  | Apply pending migrations to the database |
| `bun run db:push`     | Push schema changes directly (dev only)  |
| `bun run db:studio`   | Open Drizzle Studio (visual DB explorer) |

---

<h2 id="usage">Usage</h2>

### Available Commands

View all available Make commands:

```bash
make help
```

### Local Development

Start the development server (port 3000):

```bash
make dev
```

Access the application at `http://localhost:3000`

### Docker Deployment

#### Build and Run

Build the Docker image and start the container:

```bash
make run
```

#### Stop Container

```bash
make stop
```

#### View Logs

```bash
make logs
make logs-redis
```

Or directly with Docker:

```bash
docker logs -f my-portfolio
docker logs -f redis
```

#### Access Container Shell

```bash
make shell
```

#### Clean Environment

Remove containers, images, and build artifacts:

```bash
make clean
```

---

<h2 id="screenshots">Screenshots</h2>

<p align="center">
  <img src="https://github.com/user-attachments/assets/dc73aa3a-899b-44de-a919-227cc7fde245" width="1000" height="600" alt="Architecture">
</p>

<p align="center">
  <img src="https://res.cloudinary.com/drdpurgob/image/upload/v1791297949/Screenshot_20261006_113655_rinxc4.png" width="1000" height="600" alt="landing page">
</p>

<p align="center">
  <img src="https://res.cloudinary.com/drdpurgob/image/upload/v1791297949/Screenshot_20261006_112743_qj1bb1.png" width="1000" height="600" alt="dashboard">
</p>

<p align="center">
  <img src="https://res.cloudinary.com/drdpurgob/image/upload/v1791297949/Screenshot_20261006_112907_pjfjad.png" width="1000" height="600" alt="dashboard">
</p>

<p align="center">
  <img src="https://res.cloudinary.com/drdpurgob/image/upload/v1791297949/Screenshot_20261006_112959_zsqmzo.png" width="1000" height="600" alt="dashboard">
</p>

---

<h2 id="deployment">Deployment</h2>

### Vercel (Recommended - Production)

The application is deployed on Vercel for production use, with Neon PostgreSQL as the database backend.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Victor-Zarzar/my-portfolio)

**Important:** Don't forget to add all environment variables from `.env-example` to your Vercel project settings, including your Neon database connection string.

### Self-Hosted (VPS + Docker)

Prefer to host on your own server? I wrote a step-by-step guide covering how to deploy Next.js with Docker on a VPS:
[Deploy Next.js with Docker on a VPS](https://www.victorzarzar.com.br/blog/deploy-nextjs-docker-vps)

- **CI/CD Pipeline** - `.github/workflows/` with `ci.yaml`, `codeql-analysis.yaml`, `e2e.yaml`, `integration.yaml` and `release.yaml` for automated checks, security analysis, end-to-end tests and releases
- **Dependabot** - Monthly dependency updates for GitHub Actions and Pub packages

---

<h2 id="contributing">Contributing</h2>

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Report issues at: https://github.com/Victor-Zarzar/my-portoflio/issues

---

<h2 id="license">License</h2>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<h2 id="author">Author</h2>

Victor Zarzar - [@Victor-Zarzar](https://github.com/Victor-Zarzar)

Project Link: [https://github.com/Victor-Zarzar/my-portoflio](https://github.com/Victor-Zarzar/my-portoflio)

---
