/**
 * Fork-level feature switches.
 *
 * The upstream app can update itself from the upstream GitHub repo
 * (`/api/update` → git pull + pnpm install) and restart itself
 * (`/api/restart`). For this Taiwan fork those are OFF by default:
 * pulling upstream `main` into a localized fork would silently overwrite
 * or conflict with the zh-TW changes, and self-restarting via a spawned
 * launcher is surprising on shared / hosted installs.
 *
 * Turn them back on explicitly:
 *   SEO_ENABLE_AUTO_UPDATE=1           → /api/update + Settings update card
 *   NEXT_PUBLIC_SEO_ENABLE_RESTART=1   → /api/restart + restart buttons
 *     (NEXT_PUBLIC_ so the client-side buttons can see it too)
 */

export function autoUpdateEnabled(): boolean {
  return process.env.SEO_ENABLE_AUTO_UPDATE === "1";
}

export function selfRestartEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_SEO_ENABLE_RESTART === "1" ||
    process.env.SEO_ENABLE_RESTART === "1"
  );
}

export function disabledResponse(feature: "update" | "restart"): Response {
  const msg =
    feature === "update"
      ? "此分支（zh-TW fork）已停用從上游自動更新。若要啟用，請設定環境變數 SEO_ENABLE_AUTO_UPDATE=1。手動更新：git pull 後執行 pnpm install。"
      : "此分支（zh-TW fork）已停用自我重新啟動。若要啟用，請設定環境變數 NEXT_PUBLIC_SEO_ENABLE_RESTART=1，或手動重新啟動伺服器。";
  return Response.json({ ok: false, disabled: true, error: msg }, { status: 403 });
}
