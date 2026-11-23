# Frontend

## Setup

1. Install Node.js.
2. From this directory, run `npm install`.
3. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend origin. `VITE_PORT` controls the Vite development-server port.
4. Run `npm run dev` for local development or `npm run build` to create and type-check a production build.

## Environment variable names

| Name |
| --- |
| `VITE_API_URL` |
| `VITE_PORT` |

The app uses cookie-based authentication and sends credentials with API requests. The backend must allow the frontend origin with credentialed CORS.
