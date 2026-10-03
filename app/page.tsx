import { ApiHealthStatus } from "./components/ApiHealthStatus";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.16)_0%,_transparent_42%),radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.04)_0%,_transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,_transparent_0%,_#0b0b0c_88%)]"
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-accent">
          Practice platform
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
          PinMe
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          Timed drawing practice from your own reference boards — starting with
          a live link to the API.
        </p>

        <ApiHealthStatus />
      </main>
    </div>
  );
}
