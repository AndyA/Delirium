"use strict";

import Average from 'util/average';

const privatePrefix = /^__/;

class CoverageDay {
  constructor(year, month, day, info) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.info = info;
    this.date = new Date(Date.UTC(this.year, this.month - 1, this.day));
    this.statsCache = null;
  }

  get stats() {
    if (this.statsCache !== null)
      return this.statsCache;

    const info = this.info;
    let stats = {
      ext: {},
      q: new Average()
    };

    Object.keys(info).forEach((hour) => {
      Object.keys(info[hour]).forEach((minute) => {
        Object.keys(info[hour][minute]).forEach((service) => {

          const versions = Object.keys(info[hour][minute][service]).sort();
          const latest = versions[versions.length - 1];

          let obj = info[hour][minute][service][latest];
          if (obj.hasOwnProperty("q")) {
            const avg = new Average(obj.q);
            stats.q.add(avg);
          }

          Object.keys(obj.ext).forEach((type) => {
            stats.ext[type] = (stats.ext[type] || 0) +
              obj.ext[type] || 0;
          });
        });
      });
    });

    return this.statsCache = stats;
  }

  get quality() {
    return this.stats.q;
  }

  filesOfType(type) {
    return this.stats.ext[type] || 0;
  }
}

export default class Coverage {
  constructor(data) {
    this.data = data || {};
    this.daysCache = {};
    this.statsCache = null;
  }

  get years() {
    return Object.keys(this.data).sort().filter((v) => v !== "Z" && !privatePrefix.test(v));
  }

  daysForYear(year) {
    if (this.daysCache.hasOwnProperty(year))
      return this.daysCache[year];

    let days = [];

    Object.keys(this.data[year]).sort().forEach((month) => {
      if (month === "Z") return;
      Object.keys(this.data[year][month]).sort().forEach((day) => {
        if (day === "Z") return;
        days.push(new CoverageDay(year, month * 1, day * 1, this.data[year][month][day]));
      });
    });

    return this.daysCache[year] = days;
  }

  get stats() {
    if (this.statsCache !== null)
      return this.statsCache;

    let stats = {
      q: new Average(),
      ext: {}
    };

    this.years.forEach((year) => {
      this.daysForYear(year).forEach((d) => {
        const ds = d.stats;
        stats.q.add(ds.q);
        Object.keys(ds.ext).forEach((type) => {
          if (!stats.ext.hasOwnProperty(type))
            stats.ext[type] = new Average();
          stats.ext[type].add(ds.ext[type]);
        });
      });
    });

    return this.statsCache = stats;
  }
}
