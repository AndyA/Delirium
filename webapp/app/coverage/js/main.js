"use strict";

import $ from 'jquery';
import Color from 'color';
import Coverage from 'coverage/coverage';
import Survey from 'coverage/survey';

const DATA = "/data/coverage.json";
const CHANNEL = "pdf";
const MINFILL = 0.4;
const MAXFILL = 1.0;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MARGIN = 150;
const GAP = 2;

function canvasWidth() {
  return $(window).width() - MARGIN;
}

function makeCoverage(cvg) {
  const $coverage = $("#coverage");

  $coverage.empty();

  const width = canvasWidth();
  const height = 20;

  cvg.years.forEach(function(year) {
    const $row = $("<div></div>").addClass("row");
    $row.append($("<div></div>").addClass("year").text(year));
    $row.append($("<canvas></canvas>").addClass("calendar").attr({
      width: width,
      height: height,
      "data-year": year
    }).css({
      width: width + "px",
      height: height + "px"
    }));
    $row.append($("<div></div>").addClass("year").text(year));
    $coverage.append($row);
  });
}

function resizeCoverage(cvg) {
  const width = canvasWidth();
  $("#coverage .calendar").each(function() {
    const $this = $(this);
    $this.attr({
      width: width
    }).css({
      width: width + "px"
    });
  });
}

function drawCoverage(cvg, channel) {
  $("#coverage .calendar").each(function() {
    const $this = $(this);

    const cvs = $this[0];
    const ctx = cvs.getContext("2d");
    const w = cvs.width;
    const h = cvs.height;

    const cellWidth = w / (366 + 6);

    const year = $this.attr("data-year");
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearShift = yearStart.getUTCDay();

    ctx.save();

    // Draw Sundays
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let day = 0; day < 366; day += 7) {
      ctx.fillRect(day * cellWidth, 0, cellWidth, h);
    }

    // Get stats for whole set
    const stats = cvg.stats;
    const maxCount = stats.ext[channel].max;

    const solid = Color("rgb(200, 200, 200)");

    // Fairly arbitrary - pretty colours.
    const power = 0.28;

    cvg.daysForYear(year).forEach((d) => {
      const ds = d.stats;

      const dayNum = (d.date.getTime() - yearStart.getTime()) / DAY;
      const x = (dayNum + yearShift) * cellWidth;

      const qMax = stats.q.max;
      const qMin = Math.max(20, stats.q.min);
      const range = qMax - qMin;

      const count = ds.ext[channel] || 0;
      const size = count / maxCount;

      let col = solid;

      if (ds.hasOwnProperty("q")) {
        const val = (ds.q.average - qMin) / range;
        const a = Math.max(0, Math.min(1, Math.pow(val, power)));
        col = Color({
          h: 120 - a * 120,
          s: 100,
          v: 75
        });
      }

      ctx.fillStyle = col.rgb().string();
      ctx.fillRect(x, h / 2 - h * size, cellWidth, h * size * 2);
    });

    ctx.restore();
  });
}

function hightlightMissing($elt, str) {
  let part = str.split(/(Z+)/);
  while (part.length) {
    const good = part.shift();
    if (good.length)
      $elt.append($("<span/>").addClass("good").text(good));
    if (part.length) {
      $elt.append($("<span/>").addClass("bad").text(part.shift()));
    }
  }
}

function makeSurveyTable(srv) {
  const stats = srv.stats;
  const $survey = $("#survey");

  let cols = {};

  Object.keys(stats).forEach((key) => {
    Object.keys(stats[key]).forEach((ext) => {
      cols[ext] = true;
    });
  });

  const colName = Object.keys(cols).sort();

  let $htr = $("<tr/>").append($("<th/>").text("filename"));
  colName.forEach((label) => {
    $htr.append($("<th/>").text(label));
  });

  let $thead = $("<thead/>").append($htr);
  let $tbody = $("<tbody/>");
  let total = {};

  Object.keys(stats).sort().forEach((key) => {
    let $td = $("<td/>");
    hightlightMissing($td, key);

    let $tr = $("<tr/>").append($td);
    colName.forEach((col) => {
      var n = stats[key][col] || 0;
      $tr.append($("<td/>").text(n.toLocaleString()));
      total[col] = (total[col] || 0) + n;
    });
    $tbody.append($tr);
  });

  let $ftr = $("<tr/>").append($("<td/>").text("total"));
  colName.forEach((col) => {
    $ftr.append($("<td/>").text(total[col].toLocaleString()));
  });

  let $tfoot = $("<tfoot/>").append($ftr);

  let $table = $("<table/>").append($thead).append($tbody).append($tfoot);
  $survey.empty().append($table);
}

function drawHeatmap(cvs) {
  const ctx = cvs.getContext("2d");
  const w = cvs.width;
  const h = cvs.height;
  const end = 120;
  ctx.save();
  for (let a = 0; a < end; a++) {
    const col = Color({
      h: a,
      s: 100,
      v: 100
    });
    ctx.fillStyle = col.rgb().string();
    ctx.fillRect(a / end * w, 0, w / end + 1, h);
  }
  ctx.restore();
}

$(function() {

  $.get(DATA, (data) => {
    let cvg = new Coverage(data);
    makeCoverage(cvg);
    drawCoverage(cvg, CHANNEL);
    $(window).resize(() => {
      resizeCoverage(cvg);
      drawCoverage(cvg, CHANNEL);
    });

    makeSurveyTable(new Survey(cvg));
  });
});

