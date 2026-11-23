# Backend

## Setup

1. Install Node.js and a running MongoDB and Redis service.
2. From this directory, run `npm install`.
3. Copy `.env.example` to `.env` and fill in the variables needed for the services you use.
4. Start development mode with `npm run dev`, or production mode with `npm start`.

The server listens on `PORT` after both MongoDB and Redis connect. `CLIENT_ORIGIN` must be set to the frontend origin to enable credentialed browser requests. Judge0, Gemini, and Cloudinary variables are needed by their respective features.

The public Judge0 CE instance can be configured with `JUDGEO_BASE_URL=https://ce.judge0.com`; it accepts direct unauthenticated submissions. `JUDGEO_BASE_URL` takes precedence over `JUDGEO_HOST`. For Judge0 through RapidAPI, set `JUDGEO_HOST` to the RapidAPI host and `JUDGEO_KEY` to your RapidAPI key. For a self-hosted instance, set `JUDGEO_BASE_URL` to its full URL and provide authentication only if that deployment requires it. The backend also accepts the previous `JUDGE0_HOST` and `JUDGE0_KEY` names.

## Environment variable names

| Name |
| --- |
| `PORT` |
| `DB_CONNECT_STRING` |
| `DB_NAME` |
| `JWT_KEY` |
| `REDIS_HOST` |
| `REDIS_PORT` |
| `REDIS_PASS` |
| `JUDGEO_KEY` |
| `JUDGEO_HOST` |
| `JUDGEO_BASE_URL` |
| `GEMINI_KEY` |
| `GEMINI_MODEL` |
| `CLOUDINARY_CLOUD_NAME` |
| `CLOUDINARY_API_KEY` |
| `CLOUDINARY_API_SECRET` |
| `CLOUDINARY_API_BASE_URL` |
| `CLIENT_ORIGIN` |
| `NODE_ENV` |
| `ADMIN_EMAIL` |
| `ADMIN_PASSWORD` |

## API routes

Authentication routes use the `token` cookie. Routes marked **user** require an authenticated user; routes marked **admin** require an administrator.

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/health` | Public |
| `POST` | `/user/register` | Public |
| `POST` | `/user/login` | Public |
| `POST` | `/user/logout` | User |
| `POST` | `/user/admin/register` | Admin |
| `DELETE` | `/user/deleteProfile` | User |
| `GET` | `/user/check` | User |
| `POST` | `/problem/create` | Admin |
| `PUT` | `/problem/update/:id` | Admin |
| `DELETE` | `/problem/delete/:id` | Admin |
| `GET` | `/problem/problemById/:id` | User |
| `GET` | `/problem/getAllProblem` | User |
| `GET` | `/problem/problemSolvedByUser` | User |
| `GET` | `/problem/submittedProblem/:pid` | User |
| `POST` | `/submission/run/:id` | User |
| `POST` | `/submission/submit/:id` | User |
| `POST` | `/ai/chat` | User |
| `GET` | `/video/create/:problemId` | Admin |
| `POST` | `/video/save` | Admin |
| `DELETE` | `/video/delete/:problemId` | Admin |

Create the first administrator using `ADMIN_EMAIL` and `ADMIN_PASSWORD` with `node scripts/createFirstAdmin.js`.
Load or refresh the DSA Pattern Sheet using `node scripts/seedPatterns.js`. The seed upserts questions by their stable pattern key and does not modify user progress.

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/pattern/sheet` | User |
| `PATCH` | `/pattern/question/:id/solved` | User |
| `PATCH` | `/pattern/question/:id/revision-mark` | User |
| `POST` | `/pattern/question/:id/revised` | User |
| `POST` | `/pattern/revision/pick` | User |
