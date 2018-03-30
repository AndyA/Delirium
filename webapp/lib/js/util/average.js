"use strict";

export default class Average {
  constructor(stash) {
    stash = stash || {};
    this.count = stash.n || 0;
    this.sum = stash.s || 0;
    this.squared = stash.q || 0;
    if (this.count) {
      this.min = stash.m * 1;
      this.max = stash.M * 1;
    }
  }

  add(n) {
    if (n instanceof Average) {
      if (n.count) {
        if (this.count === 0) {
          this.min = n.min;
          this.max = n.max;
        } else {
          this.min = Math.min(this.min, n.min);
          this.max = Math.max(this.max, n.max);
        }
        this.sum += n.sum;
        this.squared += n.squared;
        this.count += n.count;
      }
    } else {
      if (this.count === 0) {
        this.min = this.max = n;
      } else {
        this.min = Math.min(this.min, n);
        this.max = Math.max(this.max, n);
      }
      this.sum += n;
      this.squared += n * n;
      this.count++;
    }
  }

  get average() {
    return this.sum / this.count;
  }

  get rms() {
    return Math.sqrt(this.squared / this.count);
  }
}
