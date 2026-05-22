/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
 content: [
  "./*.html",
  "./blog/**/*.html",
  "./js/**/*.js"
],
  theme: {
    extend: {
      colors: {
        "on-background": "#0b1c30",
        "tertiary-container": "#002201",
        "surface-bright": "#f8f9ff",
        "primary-fixed": "#dae2fd",
        "secondary": "#795911",
        "outline-variant": "#c6c6cd",
        "on-primary": "#ffffff",
        "surface": "#f8f9ff",
        "tertiary": "#000000",
        "background": "#f8f9ff",
        "primary-container": "#131b2e",
        "on-surface": "#0b1c30",
        "primary": "#000000",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      spacing: {
        base: "8px",
        "section-gap": "80px",
        "stack-lg": "32px",
        margin: "32px",
        "container-max": "1280px",
        "stack-sm": "8px",
        "stack-md": "16px",
        gutter: "24px",
      },
      fontFamily: {
        "body-lg": ["Manrope"],
        "label-md": ["Manrope"],
        "body-md": ["Manrope"],
        "headline-xl": ["Manrope"],
        "headline-md": ["Manrope"],
        "headline-lg": ["Manrope"],
      },
      fontSize: {
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
}