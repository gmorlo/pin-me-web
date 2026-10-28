export const PORTFOLIO_URL =
  process.env.NEXT_PUBLIC_PORTFOLIO_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://francke.tech"
    : "http://localhost:3000");
