export default function Privacy() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 max-w-2xl mx-auto font-[family-name:var(--font-pixel-body)]">
      <h1 className="font-[family-name:var(--font-pixel)] text-lg text-accent mb-8">PRIVACY POLICY</h1>

      <div className="flex flex-col gap-6 text-sm text-muted leading-relaxed">
        <p className="text-foreground text-xs">Last updated: April 6, 2026</p>

        <section>
          <h2 className="text-foreground font-bold mb-2">What we collect</h2>
          <p>When you upload a screenshot, the image is sent to a third-party AI provider (OpenAI / Azure OpenAI) for analysis. We do not store your images on our servers. Images are held in memory only for the duration of processing and are discarded immediately after.</p>
        </section>

        <section>
          <h2 className="text-foreground font-bold mb-2">Third-party services</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong>OpenAI / Azure OpenAI</strong> — processes your screenshot to generate verdicts. Subject to <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener" className="text-accent hover:underline">OpenAI&apos;s Privacy Policy</a>.</li>
            <li><strong>ElevenLabs</strong> — text-to-speech for verdict audio (when available). Subject to <a href="https://elevenlabs.io/privacy" target="_blank" rel="noopener" className="text-accent hover:underline">ElevenLabs&apos; Privacy Policy</a>.</li>
            <li><strong>Vercel</strong> — hosting and serverless functions. Subject to <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" className="text-accent hover:underline">Vercel&apos;s Privacy Policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground font-bold mb-2">What we don&apos;t do</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>We do not store, log, or persist your uploaded images</li>
            <li>We do not create user accounts or track identities</li>
            <li>We do not sell or share your data with anyone beyond the services listed above</li>
            <li>We do not use cookies or analytics trackers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground font-bold mb-2">Rate limiting</h2>
          <p>We use your IP address for in-memory rate limiting (5 requests per minute). IP addresses are not logged or stored persistently.</p>
        </section>

        <section>
          <h2 className="text-foreground font-bold mb-2">Content moderation</h2>
          <p>All AI-generated text is passed through OpenAI&apos;s moderation endpoint before being shown to you. Flagged content is replaced with safe defaults.</p>
        </section>

        <section>
          <h2 className="text-foreground font-bold mb-2">Contact</h2>
          <p>Questions? Reach us at <a href="https://ente.com" target="_blank" rel="noopener" className="text-accent hover:underline">ente.com</a>.</p>
        </section>
      </div>

      <a href="/" className="mt-12 text-accent font-[family-name:var(--font-pixel)] text-[10px] hover:underline">BACK TO COURT</a>
    </main>
  );
}
