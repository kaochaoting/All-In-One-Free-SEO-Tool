export const dynamic = "force-dynamic";

import { Map } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { SitemapForm } from "./sitemap-form";
import { tr } from "@/lib/i18n";

export default function SitemapPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={tr("Sitemap generator")}
        description={tr("Crawl a site and produce sitemap.xml, a plain-text URL list, and a human-readable HTML index. Same crawler the auditor uses — respects robots.txt by default.")}
        icon={Map}
        accent="cyan"
      />
      <SitemapForm />
    </div>
  );
}
