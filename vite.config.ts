import type { UserConfig } from "vite";

export default {
  server: {
    proxy: {
      "/bgacache/": {
        target: "http://localhost:5173",
        secure: false,
        rewrite: (path) => path.replace("/bgacache/", "/mocks/") + ".xml",
      },
    },
  },
} satisfies UserConfig;
