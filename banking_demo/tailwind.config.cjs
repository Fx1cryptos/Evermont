module.exports = {
  content: { relative: true, files: ["./banking/templates/**/*.html", "./banking/static/banking/*.js"] },
  safelist: ["account-savings", "account-current", "entry-deposit", "entry-withdrawal", "entry-interest"],
  theme: { extend: {
    colors: { ink: "#211936", muted: "#6d647e", violet: "#6739d5", canvas: "#f8f7fc" },
    fontFamily: { sans: ["Manrope", "system-ui", "sans-serif"] },
  } },
};
