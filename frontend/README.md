# Meeting Assistant Frontend

React 19 + TypeScript frontend built with Vite. It preserves the original
authentication, Google Calendar connection, chat history, and streamed agent
response behavior.

## Environment

Create `.env` with:

```env
VITE_DESCOPE_PROJECT_ID=your-descope-project-id
VITE_API_URL=http://localhost:4000
```

The previous `NEXT_PUBLIC_DESCOPE_PROJECT_ID` and `NEXT_PUBLIC_API_URL` names
remain supported temporarily so existing local configuration keeps working.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

The Vite development server runs at `http://localhost:5173` by default. Set the
backend `APP_URL` to that origin so CORS permits frontend requests.
