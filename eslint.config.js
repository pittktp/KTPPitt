const browserGlobals = {
  console: "readonly",
  document: "readonly",
  emailjs: "readonly",
  fetch: "readonly",
  IntersectionObserver: "readonly",
  setTimeout: "readonly",
  URL: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  __dirname: "readonly",
  console: "readonly",
  fetch: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
};

module.exports = [
  {
    ignores: ["docs/archive/**", "node_modules/**"],
  },
  {
    files: ["eslint.config.js", "api/**/*.js", "src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: nodeGlobals,
      sourceType: "commonjs",
    },
    rules: {
      eqeqeq: "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["public/assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: browserGlobals,
      sourceType: "script",
    },
    rules: {
      eqeqeq: "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-const": "error",
    },
  },
];
