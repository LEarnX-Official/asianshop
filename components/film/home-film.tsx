"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Product, Recipe } from "@/lib/types";
import { useT } from "../global/market-context";
import { InlineScript } from "../global/inline-script";
import { CityFar, CityHome, CityMid, CityNear, CitySky } from "./city";
import { Kitchen, MaskedWords } from "./kitchen";
import { BrandsScene, EuropeScene, FreshnessScene, type BrandBay } from "./scenes";
import { DinnerScene, buildDinner } from "./dinner";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Phones: the address bar grows/shrinks while scrolling. Don't recalculate pins for that (it made scenes jump).
ScrollTrigger.config({ ignoreMobileResize: true });

const setHeader = (mode: "night" | "day") => {
  document.documentElement.dataset.header = mode;
};

/**
 * The homepage film (six scenes), on every screen size. Each scene is one pinned, scrubbed timeline, created top to bottom.
 * Shopping pages never use this; search and basket stay reachable throughout, and "Skip to shop" is always offered.
 */
export function HomeFilm({
  shelf,
  bays,
  foreground,
  fresh,
  recipe,
  ingredients,
}: {
  shelf: Product[];
  bays: BrandBay[];
  foreground: number[];
  fresh: Product;
  recipe: Recipe;
  ingredients: Product[];
}) {
  const t = useT();
  const root = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { mobile, reduce } = ctx.conditions as Record<string, boolean>;
          const city = [".film-sky", ".film-far", ".film-mid", ".film-home", ".film-near"];

          if (reduce) {
            // Every move becomes a cut: show the final frame of each scene, no pins.
            gsap.set(".film-kitchen-wrap", { autoAlpha: 1 });
            gsap.set([...city, ".film-intro"], { autoAlpha: 0 });
            setHeader("day");
            const vp = document.querySelector(".brand-viewport");
            vp?.classList.add("overflow-x-auto", "md:overflow-x-auto");
            return () => vp?.classList.remove("overflow-x-auto", "md:overflow-x-auto");
          }

          /* ================= The scroll-driven film: the same scenes on PC and phone =================
             Phones get their own layouts (see each scene) and slightly shorter pins; nothing is cut. */
          const pinBase = { pin: true, scrub: 1, anticipatePin: 1 } as const;

          /* ---- Intro (plays on load, not scroll): the city lights up, the words rise ---- */
          const intro = gsap.timeline({ delay: 0.15 });
          intro
            .from(".film-star", { opacity: 0, duration: 1.2, stagger: { each: 0.015, from: "random" } }, 0)
            .from(".film-lit", { opacity: 0, duration: 0.5, stagger: { each: 0.006, from: "random" } }, 0.2)
            .from(".film-i-word", { yPercent: 115, duration: 1.2, stagger: 0.07, ease: "expo.out" }, 0.35)
            .from(".film-cue", { autoAlpha: 0, y: 12, duration: 0.8, ease: "power2.out" }, 1.3);

          /* ---- Scenes 1 + 2: the push through the window into the kitchen ---- */
          const arrive = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".film-arrive",
              start: "top top",
              end: mobile ? "+=210%" : "+=280%",
              ...pinBase,
              onUpdate: (s) => setHeader(s.progress < 0.52 ? "night" : "day"),
              // also on (re)measure, so a reload, a resize or a re-run of this effect keeps the dusk header dark
              onRefresh: (s) => s.progress < 0.52 && setHeader("night"),
              onLeave: () => setHeader("day"),
            },
          });
          arrive
            .to(".film-intro", { autoAlpha: 0, y: -70, duration: 0.12 }, 0)
            .to(".film-sky", { scale: 1.12, duration: 0.6 }, 0)
            .to(".film-far", { scale: 1.4, duration: 0.6 }, 0)
            .to(".film-mid", { scale: 2, duration: 0.6 }, 0)
            .to(".film-near", { scale: 2.8, yPercent: 40, duration: 0.5 }, 0)
            .to(".film-home", { scale: mobile ? 11 : 9, duration: 0.6, ease: "power2.in" }, 0)
            .to(".film-glow", { opacity: 1, duration: 0.4 }, 0.1)
            .to(".film-warm", { opacity: 0.85, duration: 0.1 }, 0.44)
            .to(".film-warm", { opacity: 0, duration: 0.14 }, 0.55)
            .fromTo(".film-kitchen-wrap", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.17, ease: "power2.out" }, 0.47)
            .to(city, { autoAlpha: 0, duration: 0.05 }, 0.6)
            .from(".film-k-pack", { y: -110, autoAlpha: 0, rotate: (i: number) => [-7, 5, -4, 6, -5, 4, -3, 0][i % 8], stagger: 0.035, duration: 0.12, ease: "back.out(1.7)" }, 0.6)
            .from(".film-k-eyebrow", { autoAlpha: 0, y: 16, duration: 0.08 }, 0.66)
            .from(".film-k-word", { yPercent: 115, stagger: 0.012, duration: 0.12, ease: "power3.out" }, 0.68)
            .from(".film-k-cta", { autoAlpha: 0, y: 26, duration: 0.1 }, 0.82)
            .to({}, { duration: 0.12 });

          /* ---- Scene 3: tracking shot along the shelf of brands ---- */
          const track = document.querySelector<HTMLElement>(".brand-track")!;
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          gsap.from(".film-b-word", {
            yPercent: 115,
            stagger: 0.05,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: ".film-brands", start: "top 75%", toggleActions: "play none none reverse" },
          });
          const pan = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: ".film-brands",
              start: "top top",
              end: () => `+=${distance()}`,
              ...pinBase,
              invalidateOnRefresh: true,
              onToggle: (s) => s.isActive && setHeader("night"),
              onLeave: () => setHeader("day"),
              onLeaveBack: () => setHeader("day"),
            },
          });
          gsap.to(".brand-fore", {
            x: () => -distance() * 1.7,
            ease: "none",
            scrollTrigger: { trigger: ".film-brands", start: "top top", end: () => `+=${distance()}`, scrub: 1, invalidateOnRefresh: true },
          });
          gsap.utils.toArray<HTMLElement>(".brand-bay").forEach((bay) => {
            gsap.from(bay.querySelector(".brand-pack"), {
              y: 70,
              rotate: 4,
              autoAlpha: 0.2,
              ease: "power2.out",
              scrollTrigger: { containerAnimation: pan, trigger: bay, start: "left 95%", end: "left 55%", scrub: true },
            });
          });

          /* ---- Scene 4: freshness you can see ---- */
          // the words arrive while the section scrolls in, so the pin opens on a full frame
          gsap
            .timeline({ scrollTrigger: { trigger: ".film-fresh", start: "top 80%", end: "top top", scrub: 1 } })
            .fromTo(".fresh-bignum", { xPercent: 25, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1, ease: "none" }, 0)
            .from(".film-f-word", { yPercent: 115, stagger: 0.06, duration: 0.5, ease: "power3.out" }, 0.1)
            .from(".fresh-body", { autoAlpha: 0, y: 20, duration: 0.4 }, 0.45);
          gsap
            .timeline({ scrollTrigger: { trigger: ".film-fresh", start: "top top", end: mobile ? "+=110%" : "+=130%", ...pinBase } })
            .fromTo(".fresh-pack", { rotateY: -38, rotateX: 10, scale: 0.72, x: mobile ? 50 : 140 }, { rotateY: 0, rotateX: 0, scale: 1, x: 0, duration: 0.45, ease: "power2.out" }, 0)
            .fromTo(".fresh-stamp", { scale: 2.4, autoAlpha: 0, rotate: -20 }, { scale: 1, autoAlpha: 1, rotate: -7, duration: 0.16, ease: "back.out(2.2)" }, 0.46)
            .fromTo(".fresh-roll", { yPercent: 0 }, { yPercent: (_: number, el: HTMLElement) => -Number(el.dataset.digit) * 10, duration: 0.3, stagger: 0.02, ease: "power3.out" }, 0.5)
            .to({}, { duration: 0.2 });

          /* ---- Scene 5: tonight's dinner, cooked by scrolling ----
             The title, pot and tiles arrive while the section scrolls in; the pinned part is all cooking. */
          buildDinner(gsap, gsap.timeline({ scrollTrigger: { trigger: ".film-dinner", start: "top 85%", end: "top top", scrub: 1 } }), 1, { cook: false });
          const dinnerTl = gsap.timeline({
            scrollTrigger: {
              trigger: ".film-dinner",
              start: "top top",
              end: mobile ? "+=130%" : "+=150%",
              ...pinBase,
              invalidateOnRefresh: true,
              onToggle: (s) => s.isActive && setHeader("night"),
              onLeave: () => setHeader("day"),
              onLeaveBack: () => setHeader("day"),
            },
          });
          buildDinner(gsap, dinnerTl, 1, { intro: false, start: 0.06 }).to({}, { duration: 0.12 });

          /* ---- Scene 6: routes from Kraków ---- */
          gsap
            .timeline({ scrollTrigger: { trigger: ".film-europe", start: "top 75%", end: "center 55%", scrub: 1 } })
            .from(".film-e-word", { yPercent: 115, stagger: 0.04, duration: 0.25 }, 0)
            .fromTo(".eu-route", { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.05, duration: 0.5, ease: "power1.inOut" }, 0.1)
            .from(".eu-city", { scale: 0, transformOrigin: "50% 50%", stagger: 0.05, duration: 0.15 }, 0.3)
            .from(".eu-label", { autoAlpha: 0, x: -8, stagger: 0.05, duration: 0.15 }, 0.35)
            .from(".eu-soon", { autoAlpha: 0, duration: 0.25 }, 0.6)
            .fromTo(".eu-seal", { scale: 1.9, autoAlpha: 0, rotate: -34 }, { scale: 1, autoAlpha: 1, rotate: -8, duration: 0.22, ease: "back.out(1.8)" }, 0.72);

          /* ---- "Skip to shop" while the film plays ---- */
          ScrollTrigger.create({
            trigger: ".film-arrive",
            start: "top top",
            endTrigger: ".film-europe",
            end: "top 40%",
            onToggle: (s) => skip.current && (skip.current.dataset.show = String(s.isActive)),
          });

          const onLoad = () => ScrollTrigger.refresh();
          window.addEventListener("load", onLoad);
          document.fonts?.ready.then(() => ScrollTrigger.refresh());
          return () => window.removeEventListener("load", onLoad);
        },
      );
      return () => {
        delete document.documentElement.dataset.header;
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="home-film -mt-[124px] md:-mt-[68px] lg:-mt-[112px]">
      {/* header starts in night mode over the dusk scene, set before first paint */}
      <InlineScript html={`document.documentElement.dataset.header=matchMedia('(prefers-reduced-motion: reduce)').matches?'day':'night'`} />

      <section className="film-arrive relative h-svh overflow-hidden bg-[#141a33]" aria-label={t.brandLine}>
        <CitySky />
        <CityFar />
        <CityMid />
        <CityHome />
        <CityNear />
        <div className="film-warm pointer-events-none absolute inset-0 bg-[#ffcf86] opacity-0 mix-blend-soft-light" />
        <div className="film-intro absolute inset-x-0 top-[24vh] z-10 px-5 text-center text-linen sm:top-[26vh]">
          <p className="font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.02em] drop-shadow-[0_2px_20px_rgba(10,10,30,0.6)] sm:text-6xl lg:text-[84px]">
            <MaskedWords text={t.filmLine1} wordClass="film-i-word" />
            <br />
            <MaskedWords text={t.filmLine2} wordClass="film-i-word" className="italic text-[#ffd9a0]" />
          </p>
        </div>
        <div className="film-cue absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 text-sm tracking-wide text-linen/80">
          <span>{t.scrollCue}</span>
          <span className="relative h-10 w-px overflow-hidden bg-linen/25">
            <span className="cue-line absolute inset-x-0 top-0 h-1/2 bg-linen" />
          </span>
        </div>
        <div className="film-kitchen-wrap invisible absolute inset-0 z-20 opacity-0">
          <Kitchen packs={shelf} />
        </div>
        <div className="grain z-30" />
      </section>

      <BrandsScene bays={bays} foreground={foreground} />
      <FreshnessScene product={fresh} />
      <DinnerScene recipe={recipe} ingredients={ingredients} />
      <EuropeScene />

      <a
        ref={skip}
        href="#shop"
        data-show="false"
        onClick={(e) => {
          e.preventDefault();
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document.getElementById("shop")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        }}
        className="skip-shop fixed bottom-5 right-5 z-40 rounded-full bg-ink/85 px-5 py-3 text-sm font-semibold text-linen shadow-lift backdrop-blur transition-[opacity,transform] duration-300"
      >
        {t.skipToShop} ↓
      </a>
    </div>
  );
}
