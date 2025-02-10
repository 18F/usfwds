/* eslint-disable arrow-body-style */

const { dest, src } = require("gulp");
const buffer = require("vinyl-buffer");
const browserify = require("browserify");
const childProcess = require("child_process");
const rename = require("gulp-rename");
const source = require("vinyl-source-stream");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const merge = require("merge-stream");
const dutil = require("./utils/doc-util");

module.exports = {
  compileJS() {
    dutil.logMessage("javascript", "Compiling JavaScript");
    let packageName = dutil.pkg.name.replace("@uswds/", "");
    const streams = Object.entries({
      [packageName]: browserify({
        entries: ["packages/uswds-core/src/js/start.js"],
        debug: true,
      })
        .transform("babelify", {
          global: true,
          presets: ["@babel/preset-env"],
        })
        .bundle()
        .pipe(source(`${packageName}.js`))
        .pipe(buffer()),
      "uswds-init": src("packages/uswds-core/src/js/uswds-init.js"),
    }).map(([basename, stream]) => {
      let mappedStream = stream
        .pipe(rename({ basename }))
        .pipe(dest("dist/js"));

      if (basename !== "uswds-init") {
        mappedStream = mappedStream.pipe(sourcemaps.init({ loadMaps: true }));
      }

      mappedStream = mappedStream
        .on("error", function handleError(error) {
          dutil.logError(error);
          this.emit("end");
        })
        .pipe(uglify())
        .pipe(
          rename({
            suffix: ".min",
          })
        );

      if (basename !== "uswds-init") {
        mappedStream = mappedStream.pipe(sourcemaps.write("."));
      }

      return mappedStream.pipe(dest("dist/js"));
    });

    return merge(streams);
  },
  typeCheck() {
    return new Promise((resolve, reject) => {
      childProcess
        .spawn("./node_modules/.bin/tsc", { stdio: "inherit" })
        .on("error", reject)
        .on("exit", (code) => {
          if (code === 0) {
            dutil.logMessage("typecheck", "TypeScript likes our code!");
            resolve();
          } else {
            reject(new Error("TypeScript failed, see output for details!"));
          }
        });
    });
  },
};
