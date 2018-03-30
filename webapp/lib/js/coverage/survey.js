"use strict";

const privatePrefix = /^__/;

function getClass(object) {
  return Object.prototype.toString.call(object).slice(8, -1);
}

function walkData(data, path, maxDepth, cb) {
  if (path.length < maxDepth && getClass(data) === "Object") {
    Object.keys(data).forEach((key) => {
      if (privatePrefix.test(key))
        return;
      path.push(key);
      walkData(data[key], path, maxDepth, cb);
      path.pop();
    });
  } else {
    cb(data, path.slice(0));
  }
}

export default class Survey {
  constructor(cvg) {
    this.cvg = cvg;
    this.statsCache = null;
  }

  get stats() {
    if (this.statsCache !== null)
      return this.statsCache;

    const label = ["Y", "M", "D", "H", "M", "C"];
    let width = [0, 0, 0, 0, 0, 0];
    let count = {};

    walkData(this.cvg.data, [], 6, (val, path) => {
      const key = path.map((x, i) => x === "Z" ? "Z" : label[i]).join("");
      count[key] = count[key] || {};

      const versions = Object.keys(val).sort();
      const latest = versions[versions.length - 1];

      if (val[latest].ext) {
        Object.keys(val[latest].ext).forEach((ext) => {
          count[key][ext] = (count[key][ext] || 0) + val[latest].ext[ext];
        });
      }

      // Find width of each field
      path.map((x) => x.length).forEach((len, i) => {
        width[i] = Math.max(width[i], len);
      });
    });

    let stats = {};
    Object.keys(count).forEach((key) => {
      const path = key.split("").map((x, i) => x.repeat(width[i])).join(" ");
      stats[path] = count[key];
    });

    return this.statsCache = stats;
  }
}
