type ApiHealth = {
  status: string;
  service: string;
  timestamp: string;
};

type ApiHealthResult = {
  ok: boolean;
  data?: ApiHealth;
  message?: string;
};

async function fetchApiHealth(apiBaseUrl: string): Promise<ApiHealthResult> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/health`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `API returned ${response.status}`,
      };
    }

    const data = (await response.json()) as ApiHealth;
    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown connection error';
    return { ok: false, message };
  }
}

export default async function Home() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001';
  const health = await fetchApiHealth(apiBaseUrl);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold">PesagiGo Web - API Status</h1>
        <p className="text-sm text-slate-300">
          API Base URL: <span className="font-mono text-cyan-300">{apiBaseUrl}</span>
        </p>

        {health.ok && health.data ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-emerald-300">Backend terhubung.</p>
            <p className="text-sm text-slate-200">Service: {health.data.service}</p>
            <p className="text-sm text-slate-200">Status: {health.data.status}</p>
            <p className="text-sm text-slate-200">Time: {health.data.timestamp}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="text-rose-300">Backend belum terhubung.</p>
            <p className="text-sm text-slate-200">Error: {health.message}</p>
          </div>
        )}
      </section>
    </main>
  );
}
