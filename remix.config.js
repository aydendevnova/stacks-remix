/** @type {import('@remix-run/dev').AppConfig} */
export default {
  tailwind: {
    config: "./tailwind.config.js",
  },
  serverDependenciesToBundle: ["tailwindcss"],
  postcss: true,
};
