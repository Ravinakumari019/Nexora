export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Nexora</h1>
        <p className="text-muted-foreground text-lg">
          Real-time messaging meets AI.
        </p>
      </div>

      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Project Setup Complete ✓</h2>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>✓ Next.js 16 + React 19</li>
          <li>✓ TypeScript (strict)</li>
          <li>✓ Tailwind CSS v4</li>
          <li>✓ shadcn/ui (base-nova)</li>
          <li>✓ Google Fonts (Poppins + Inter)</li>
          <li>✓ Nexora Design Tokens</li>
        </ul>
      </div>
    </main>
  );
}
