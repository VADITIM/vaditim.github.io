/** Set at build time in `.env.production`; falls back to the local `dotnet run` port. */
export const API_BASE_URL: string = import.meta.env.VITE_COMMENTS_API_URL ?? 'http://localhost:5282'
