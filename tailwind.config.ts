import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Podemos adicionar nossas cores personalizadas aqui depois
        primary: '#9333ea', // Roxo
      }
    },
  },
  plugins: [],
};
export default config;
