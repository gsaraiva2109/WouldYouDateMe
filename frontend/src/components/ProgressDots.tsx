export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="dots" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`dot${i === current ? " active" : ""}`} />
      ))}
    </div>
  );
}
