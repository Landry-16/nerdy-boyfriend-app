// Shown instead of a blank page when required environment variables are
// missing, so a misconfigured deployment fails loudly instead of silently.
export function ConfigError() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-6">
      <div className="max-w-sm space-y-3 rounded-3xl bg-white/70 p-6 text-center">
        <h1 className="text-lg font-semibold text-ink">Configuration manquante</h1>
        <p className="text-sm text-ink/70">
          Les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ne sont pas definies. Verifie le fichier .env en
          local, ou les variables d'environnement du projet sur la plateforme d'hebergement, puis redeploie.
        </p>
      </div>
    </div>
  )
}
