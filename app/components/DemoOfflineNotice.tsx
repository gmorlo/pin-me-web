const linkClassName = "text-foreground underline underline-offset-4 whitespace-nowrap hover:text-accent";

export function DemoOfflineNotice() {
  return (
    <div className="mt-6 border-l-2 border-warn pl-4" role="status">
      <p className="text-sm font-medium text-foreground">
        The live demo is offline right now.
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        The API is not hosted at the moment, so sign-in and boards are
        unavailable here. PinMe runs locally. Screenshots, a demo GIF and the
        code are on GitHub:{" "}
        <a href="https://github.com/gmorlo/pin-me-web" className={linkClassName} target="_blank" rel="noreferrer">
          pin-me-web
        </a>{" "}
        ·{" "}
        <a href="https://github.com/gmorlo/pin-me-api" className={linkClassName} target="_blank" rel="noreferrer">
          pin-me-api
        </a>
      </p>
    </div>
  );
}
