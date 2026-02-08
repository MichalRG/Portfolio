module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu"],
      },
    },
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
  });
};
