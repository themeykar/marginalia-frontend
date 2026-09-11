export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup"],
      disallow: ["/dashboard", "/books/", "/year-in-books"],
    },
    sitemap: "https://marginalia-online.vercel.app/sitemap.xml",
  };
}
