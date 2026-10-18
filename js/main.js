/* =============================================================================
   Radhia Laidi — Portfolio
   JavaScript natif, sans dépendance : menu mobile, barre fixe, état actif de
   la navigation et révélations progressives. Aucun innerHTML, aucun eval.

   Principe de sûreté : le contenu est visible par défaut. La classe "anim"
   (posée dans le <head>) n'est conservée que si ce script s'exécute.
   En cas d'échec, le filet de sécurité de index.html réaffiche tout.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
  var hasIO = "IntersectionObserver" in window;

  function showAll() {
    root.classList.remove("anim");
    var all = document.querySelectorAll(".rv");
    for (var i = 0; i < all.length; i++) all[i].classList.add("in");
  }

  try {
    /* 1. Année du pied de page */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* 2. Menu mobile */
    var burger = document.getElementById("burger");
    var menu = document.getElementById("menu");

    function setMenu(open) {
      if (!menu || !burger) return;
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    }

    if (burger && menu) {
      burger.addEventListener("click", function () {
        setMenu(!menu.classList.contains("is-open"));
      });

      var links = menu.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function () {
          setMenu(false);
        });
      }

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
          setMenu(false);
          burger.focus();
        }
      });

      document.addEventListener("click", function (e) {
        if (!menu.classList.contains("is-open")) return;
        if (menu.contains(e.target) || burger.contains(e.target)) return;
        setMenu(false);
      });

      window.addEventListener("resize", function () {
        if (window.innerWidth > 960) setMenu(false);
      });
    }

    /* 3. Barre fixe */
    var bar = document.getElementById("topbar");
    function onScroll() {
      if (bar) bar.classList.toggle("is-stuck", window.scrollY > 10);
    }

    /* 4. État actif (scroll-spy) */
    var navLinks = [];
    var spyTargets = [];
    if (menu) {
      navLinks = Array.prototype.slice.call(menu.querySelectorAll('.menu__link[href^="#"]'));
      for (var j = 0; j < navLinks.length; j++) {
        var id = navLinks[j].getAttribute("href").slice(1);
        var sec = id ? document.getElementById(id) : null;
        if (sec) spyTargets.push(sec);
      }
    }

    function setActive(id) {
      for (var k = 0; k < navLinks.length; k++) {
        var on = navLinks[k].getAttribute("href") === "#" + id;
        navLinks[k].classList.toggle("is-on", on);
        if (on) navLinks[k].setAttribute("aria-current", "true");
        else navLinks[k].removeAttribute("aria-current");
      }
    }

    if (hasIO && spyTargets.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          for (var n = 0; n < entries.length; n++) {
            if (entries[n].isIntersecting) setActive(entries[n].target.id);
          }
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      for (var m = 0; m < spyTargets.length; m++) spy.observe(spyTargets[m]);
    }

    /* 5. Révélations progressives */
    if (reduce || !hasIO) {
      showAll();
    } else {
      var rv = document.querySelectorAll(".rv");

      var revealer = new IntersectionObserver(
        function (entries, obs) {
          for (var p = 0; p < entries.length; p++) {
            if (entries[p].isIntersecting) {
              entries[p].target.classList.add("in");
              obs.unobserve(entries[p].target);
            }
          }
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
      );
      for (var q = 0; q < rv.length; q++) revealer.observe(rv[q]);

      /* Témoin : si l'IntersectionObserver ne signale rien, on affiche tout. */
      var ok = false;
      var sentinel = document.createElement("span");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.cssText =
        "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
      document.body.appendChild(sentinel);

      var probe = new IntersectionObserver(function (entries) {
        for (var r = 0; r < entries.length; r++) {
          if (entries[r].isIntersecting) ok = true;
        }
        probe.disconnect();
        if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
        if (!ok) showAll();
      });
      probe.observe(sentinel);

      /* Filet de sécurité : si rien n'a été révélé après 1,5 s (observateur
         défaillant), on affiche tout. Aucun contenu ne doit rester invisible. */
      window.setTimeout(function () {
        if (!document.querySelectorAll(".rv.in").length) showAll();
      }, 1500);
    }

    /* 6. Barre fixe : rendu léger */
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
      },
      { passive: true }
    );
    onScroll();

    /* Initialisation réussie : le filet de sécurité conserve l'animation. */
    window.__radhiaAnim = true;
  } catch (err) {
    showAll();
    window.__radhiaAnim = true;
  }
})();
