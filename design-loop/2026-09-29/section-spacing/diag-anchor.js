(async function () {
  var out = {};
  for (var h of ["#control-tower", "#customers", "#proof-eyebrow"]) {
    location.hash = "";
    scrollTo(0, 0);
    await new Promise(function (r) { setTimeout(r, 150); });
    location.hash = h;
    await new Promise(function (r) { setTimeout(r, 400); });
    var eb = h === "#customers" ? document.getElementById("logos-heading") : document.querySelector(h);
    out[h] = Math.round(eb.getBoundingClientRect().top);
  }
  return out;
})()
