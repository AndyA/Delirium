"use strict";

var gulp = require("gulp");
var gutil = require("gulp-util");
var notify = require("gulp-notify");
var uglify = require("gulp-uglify");
var less = require("gulp-less");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var transform = require("vinyl-transform");
var through2 = require("through2");
var sourcemaps = require("gulp-sourcemaps");
var exorcist = require("exorcist");
var watchify = require("watchify");
var Q = require("q");
var prettyHrtime = require("pretty-hrtime");
var path = require("path");

var paths = require("./webapp/paths");

function flatten() {
  var out = [];
  for (var i = 0; i < arguments.length; i++) {
    var elt = arguments[i];
    if (Array.isArray(elt))
      Array.prototype.push.apply(out, elt);
    else
      out.push(elt);
  }
  return out;
}

gulp.task("less", function() {
  var l = less({
    style: "compressed",
    paths: paths.less_libs
  });

  l.on("error", function(e) {
    gutil.log(e);
    this.emit("end");
  });

  return gulp.src(paths.less)
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(l)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.webroot));
});

gulp.task("watchless", ["less"], function() {
  var watchFiles = flatten(paths.less, paths.less_libs.map(function(dir) {
    return path.join(dir, "**", "*.less")
  }));
  gulp.watch(watchFiles, ["less"]);
});

function makeBundler(watch) {
  var promises = [];

  var src = gulp.src(paths.js, {
    read: false
  });

  src.pipe(through2.obj(function(file, enc, next) {
    var bundler = browserify(file.path, {
      debug: true,
      cache: {},
      packageCache: {},
      fullPaths: true,
      paths: paths.js_libs
    })
      .transform("babelify", {
        presets: ["es2015", "react"]
      });

    //    bundler.transform('uglifyify');

    var bundle = function() {
      var startTime = process.hrtime();
      gutil.log("Starting bundler for", gutil.colors.cyan(file.relative));
      return bundler.bundle()
        .on("error", gutil.log)
        .on("end", function() {
          var endTime = process.hrtime(startTime);
          gutil.log("Finished bundler for", gutil.colors.cyan(file.relative),
            "after", gutil.colors.magenta(prettyHrtime(endTime)));
        })
        .pipe(exorcist(path.join(paths.webroot, file.relative + ".map")))
        .pipe(source(file.relative))
        .pipe(gulp.dest(paths.webroot));
    }

    if (watch) {
      bundler.plugin(watchify, {
        ignoreWatch: true
      });
      bundler.on('update', bundle);
    }

    var def = Q.defer();
    bundle().on("end", def.resolve.bind(def));
    promises.push(def.promise);

    next(null, file);
  }))
    .on("data", function() {})
    .on("end", function() {});

  return Q.all(promises);
}

gulp.task("watchify", function() {
  return makeBundler(true);
});

gulp.task("browserify", function() {
  return makeBundler(false);
});

gulp.task("build", ["less", "browserify"]);
gulp.task("watch", ["watchless", "watchify"]);
gulp.task("default", ["build"]);
