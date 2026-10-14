const browserGlobals = {
  console: "readonly",
  crypto: "readonly",
  document: "readonly",
  fetch: "readonly",
  IntersectionObserver: "readonly",
  setTimeout: "readonly",
  URL: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  __dirname: "readonly",
  AbortSignal: "readonly",
  console: "readonly",
  fetch: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
  URL: "readonly",
};

module.exports = [
  {
    ignores: ["docs/archive/**", "node_modules/**"],
  },
  {
    files: ["eslint.config.js", "api/**/*.js", "src/**/*.js", "test/**/*.js"],
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
