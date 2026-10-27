"use client";

import { useState } from "react";

/**
 * "Welkom thuis": een camerabeweging door de foto's van het huis, via de voordeur naar het dashboard.
 * De animatie zelf is puur CSS (zie globals.css), dus hij start meteen en wacht niet op data.
 * Tikken op "Overslaan" sluit hem direct.
 */
export function Intro() {
  const [skipped, setSkipped] = useState(false);
  if (skipped) return null;

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-shot shot-hoek">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/huis/hoek.jpg" alt="" fetchPriority="high" decoding="async" />
      </div>
      <div className="intro-shot shot-voor">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/huis/voor.jpg" alt="" fetchPriority="high" decoding="async" />
      </div>
      <div className="intro-vignette" />
      <div className="intro-glow" />
      <div className="intro-label">
        <p>Het Kasteeltje</p>
        <p className="serif-italic">Welkom thuis</p>
      </div>
      <button type="button" className="intro-skip" tabIndex={-1} onClick={() => setSkipped(true)}>
        Overslaan
      </button>
    </div>
  );
}
