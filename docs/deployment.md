# Resume Shapeshifter Deployment Plan

This document outlines the architecture, environment settings, and steps required to deploy the **Resume Shapeshifter** application to production environments.

---

## 1. Overview & Architecture

Resume Shapeshifter is a Next.js application. Depending on your hosting provider, it can be deployed as a **Serverless Application** (Vercel) or a **Stateful/Containerized Application** (Docker on Railway, Render, VPS, or AWS).

### Core Components to Deploy
* **Frontend (Next.js client-side pages)**: Fully static and server-rendered routes.
* **Serverless Route Handlers (`/api/*`)**:
  * `/api/parse/resume`: Extracts text from PDF, DOCX, or TXT.
  * `/api/tailor`: Tailors resume bullets against a job description via the Groq LLM API.
  * `/api/export/pdf`: Generates side-by-side comparison or tailored ATS PDFs.

---

## 2. Environment Variables

Configure the following environment variables on your hosting provider:

| Variable | Required | Default / Recommended | Description |
|---|---|---|---|
| `GROQ_API_KEY` | **Yes** | N/A (Get at [console.groq.com](https://console.groq.com/)) | API key used by the backend service to call Groq LLMs. |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | The model used for parsing, scoring, and tailoring. |
| `NODE_ENV` | No | `production` | Standard Node environment setting. |

---

## 3. Option A: Deploying on Vercel (Recommended)

Vercel is the natural deployment target for Next.js applications and handles routing, optimization, and scaling automatically.

### Step-by-Step Vercel Deployment

1. **Push your code** to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Import your project repository.
4. In the configuration dashboard:
   * **Framework Preset**: Ensure `Next.js` is selected.
   * **Node.js Version**: Go to Settings > General and select **Node.js 20.x** or **22.x**.
5. Expand the **Environment Variables** section and add:
   * Key: `GROQ_API_KEY` / Value: *[Your API key]*
6. Click **Deploy**. Vercel will build and assign a public `.vercel.app` domain.

### Serverless Function Limits on Vercel
Vercel packages Next.js API routes into serverless functions. Be aware of the following constraints:
* **Hobby (Free) Account Timeout**: Serverless functions have a maximum execution timeout of **10 seconds**.
  > [!WARNING]
  > Parsing very large resumes or making multiple slow LLM requests may exceed this 10-second limit and result in a `504 Gateway Timeout`. If you encounter timeouts, you must upgrade to a Vercel Pro account (which allows up to **300 seconds** of execution time configured via `vercel.json`) or advise users to use shorter resumes.
* **Max Payload Size**: Vercel limits request and response bodies to **4.5 MB**. Ensure uploaded resume files do not exceed this limit.
* **PDF Export Fallback**: Because serverless functions have a 50MB size limit, full headless browser binary execution (Playwright Chromium) is generally not supported in standard Vercel serverless containers. The export API will automatically detect the lack of native Chromium and fall back to browser-based printing (via the standard window print workflow).

---

## 4. Option B: Self-Hosted / Docker Deployment

If you want headless PDF generation with Playwright Chromium enabled in production, or if you want to bypass the 10-second serverless execution limits, you should deploy via Docker on platforms like Railway, Render, Fly.io, or your own VPS.

### Dockerfile
Below is a highly optimized, multi-stage `Dockerfile` that packages the application, handles native dependencies (for `@napi-rs/canvas` and `pdf-parse`), and installs Chromium for headless PDF printing:

```dockerfile
# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install system dependencies for Playwright and Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
```

### Deploying the Docker Container

1. **Railway**: Link your repository, select Dockerfile deployment, expose port `3000`, and add `GROQ_API_KEY` under the Variables tab.
2. **VPS (using Docker Compose)**:
   Create a `docker-compose.yml` file:
   ```yaml
   version: '3.8'
   services:
     resume-shapeshifter:
       build: .
       ports:
         - "3000:3000"
       environment:
         - GROQ_API_KEY=your_groq_api_key_here
         - GROQ_MODEL=llama-3.3-70b-versatile
       restart: always
   ```
   Run it with `docker compose up -d`.

---

## 5. Post-Deployment Verification

Once deployed, run these checks to verify the platform is fully operational:

1. **Homepage Check**: Visit the deployment URL and verify the homepage loads and the "Start Tailoring" button is clickable.
2. **Text File & TXT Parsing**: Go to the tailor page, upload a sample plain text resume, paste a job description, and click **Analyze & Tailor**. Confirm that scoring, gap analysis, and tailored bullet lists load correctly.
3. **PDF Resume Upload**: Upload a PDF resume. Verify the file parser successfully extracts text (validates that `pdf-parse` and its worker resolve correctly).
4. **PDF Exports**: On the results page, click **Comparison PDF** and **Tailored Resume PDF**. Confirm the PDF document is compiled and downloaded successfully.
