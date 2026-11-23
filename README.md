# CodeCompact

CodeCompact is a coding-practice platform with a Node.js/Express API in `backend/` and a Vite/React client in `frontend/`.

## Requirements

- Node.js and npm
- MongoDB and Redis for backend persistence and authentication
- Environment credentials for optional Judge0 code execution, Gemini chat, and Cloudinary video uploads

## Run locally

Open two terminals from the repository root:

```sh
cd backend
npm install
cp .env.example .env
# Fill the required values in backend/.env
npm run dev
```

```sh
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL to the backend origin
npm run dev
```

Set `CLIENT_ORIGIN` in `backend/.env` to the frontend origin and configure the frontend's `VITE_API_URL` to the backend origin. Both apps must use matching origins/ports and the backend must have MongoDB and Redis available.

See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for environment-variable names, routes, and app-specific commands.
