module.exports = {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["docs/archive/**/*.css"],
  rules: {
    "no-descending-specificity": null,
    "selector-class-pattern": null,
  },
};
