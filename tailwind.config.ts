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
        // Nossa paleta de cores
        background: '#0a090f', // Um preto quase puro, com um toque de azul/roxo
        surface: '#181622',    // Cor para "superfícies" como cards e modais
        primary: '#8A2BE2',    // Roxo principal (BlueViolet)
        'primary-hover': '#9932CC', // Roxo mais vibrante para hover (MediumOrchid)
        secondary: '#4A00E0',   // Um roxo/azul mais profundo para gradientes
        accent: '#C026D3',      // Roxo/fúcsia para acentos e destaques
        'text-main': '#E0E0E0', // Texto principal (branco suave)
        'text-secondary': '#A0A0A0', // Texto secundário (cinza claro)
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin para estilizar formulários mais facilmente
  ],
};
export default config;
