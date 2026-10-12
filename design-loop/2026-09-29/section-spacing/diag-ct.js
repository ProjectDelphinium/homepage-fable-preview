(function () {
  var out = [];
  ["product", "community", "engagement"].forEach(function (id) {
    var s = document.getElementById(id), t = s.getBoundingClientRect().top + scrollY;
    function r(q) {
      var el = s.querySelector(q); if (!el) return q + " -";
      var b = el.getBoundingClientRect();
      return q + " top=" + Math.round(b.top + scrollY - t) + " bot=" + Math.round(b.bottom + scrollY - t);
    }
    out.push(id + " h=" + Math.round(s.getBoundingClientRect().height) + " rows=" + getComputedStyle(s.querySelector(".dl-prod")).gridTemplateRows + " gap=" + getComputedStyle(s.querySelector(".dl-prod")).rowGap,
      [".dl-wrap", ".dl-prod", ".dl-prod > :first-child", ".dl-prod__media", ".dl-prod__detail-wrap", ".dl-prod__detail", ".dl-prod__quote", ".dl-prod__quote .dl-prod__more", ".dl-prod__shots", ".dl-wrap > .dl-punch", ".dl-eb-foot"].map(r).join(" | "));
  });
  return out;
})()
