const log = require("fancy-log");
const colors = require("ansi-colors");
const pkg = require("../../package.json");

const shellPrefix = "$";

function drawFlagBW() {
  log(colors.white(""));
  log(colors.white(" ★   ★   ★   ★   ★   ★ █████████████████████████████████"));
  log(colors.white("   ★   ★   ★   ★   ★                                    "));
  log(colors.white(" ★   ★   ★   ★   ★   ★ █████████████████████████████████"));
  log(colors.white("   ★   ★   ★   ★   ★                                    "));
  log(colors.white(" ★   ★   ★   ★   ★   ★ █████████████████████████████████"));
  log(colors.white("   ★   ★   ★   ★   ★                                    "));
  log(colors.white(" ★   ★   ★   ★   ★   ★ █████████████████████████████████"));
  log(colors.white("                                                        "));
  log(colors.white("████████████████████████████████████████████████████████"));
  log(colors.white("                                                        "));
  log(colors.white("████████████████████████████████████████████████████████"));
  log(colors.white("                                                        "));
  log(colors.white("████████████████████████████████████████████████████████"));
  log(colors.white(""));
}

function drawFlagColor() {
  log(colors.white(""));
  log(colors.white(" ★   ★   ★   ★   ★   ★ ") +
    colors.red("█████████████████████████████████"));
  log(colors.white("   ★   ★   ★   ★   ★   ") +
    colors.white("█████████████████████████████████"));
  log(colors.white(" ★   ★   ★   ★   ★   ★ ") +
    colors.red("█████████████████████████████████"));
  log(colors.white("   ★   ★   ★   ★   ★   ") +
    colors.white("█████████████████████████████████"));
  log(colors.white(" ★   ★   ★   ★   ★   ★ ") +
    colors.red("█████████████████████████████████"));
  log(colors.white("   ★   ★   ★   ★   ★   ") +
    colors.white("█████████████████████████████████"));
  log(colors.white(" ★   ★   ★   ★   ★   ★ ") +
    colors.red("█████████████████████████████████"));
  log(colors.white("████████████████████████████████████████████████████████"));
  log(colors.red("████████████████████████████████████████████████████████"));
  log(colors.white("████████████████████████████████████████████████████████"));
  log(colors.red("████████████████████████████████████████████████████████"));
  log(colors.white("████████████████████████████████████████████████████████"));
  log(colors.red("████████████████████████████████████████████████████████"));
  log(colors.white(""));
}

module.exports = {
  pkg: {
    name: pkg.name,
    version: pkg.version,
  },

  dirName: `${pkg.name}-${pkg.version}`,

  logIntroduction() {
    log(colors.white(""));
    log(colors.yellow(` Building USWDS v${pkg.version}`));
    drawFlagBW();
  },

  logPostscript() {
    log(colors.white(""));
    log(colors.yellow(` USWDS v${pkg.version} built!`));
    drawFlagColor();
  },

  logCommand(name, message) {
    log(shellPrefix, colors.cyan(name), colors.magenta(message));
  },

  logHelp(name, message) {
    log(shellPrefix, colors.cyan(name), colors.yellow(message));
  },

  logData(name, message) {
    log(colors.cyan(name), colors.yellow(message));
  },

  logError(name, message) {
    log(colors.red(name), colors.yellow(message));
  },

  logMessage(name, message) {
    log(colors.cyan(name), colors.green(message));
  },
};
