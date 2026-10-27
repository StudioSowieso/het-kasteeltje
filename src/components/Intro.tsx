/**
 * "Poort openen": een beslagen raam dat in banen wordt schoongeveegd met een glazenwassersrubber.
 * Puur CSS (zie globals.css), dus het draait meteen, zonder te wachten op JavaScript of data.
 * De app eronder is al zichtbaar en bruikbaar; de overlay vangt geen klikken af.
 */
const BANDS = 6;

export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      {Array.from({ length: BANDS }).map((_, i) => (
        <div
          key={i}
          className={`intro-band ${i % 2 === 0 ? "ltr" : "rtl"}`}
          style={{
            top: `${(i * 100) / BANDS}%`,
            height: `calc(${100 / BANDS}% + 1px)`,
            animationDelay: `${0.2 + i * 0.2}s`,
          }}
        >
          <span className="intro-blade" style={{ animationDelay: `${0.2 + i * 0.2}s` }} />
        </div>
      ))}
      <div className="intro-label">
        <p>Het Kasteeltje</p>
        <p className="serif-italic">Poort openen…</p>
      </div>
    </div>
  );
}
