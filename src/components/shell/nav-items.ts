/**
 * Shared navigation data for the desktop sidebar AND the mobile drawer.
 *
 * The mobile drawer used to carry its own hardcoded list of 11 links —
 * out of ~226 routes, eight of them sharing a single generic icon — so
 * phone users could reach a tenth of the app, and the two lists were
 * free to drift apart with nothing to catch it. CLAUDE.md notes most
 * SEOs check rankings on a phone, which made that the wrong place to
 * cut corners.
 *
 * One definition, two renderers.
 */

import {
  ExternalLink,
  Activity,
  Bot,
  Building,
  ClipboardList,
  FileDown,
  FileSignature,
  FileStack,
  Gauge,
  GitCompare,
  GitMerge,
  Globe,
  BookOpen,
  GraduationCap,
  History,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  Link2,
  ListChecks,
  MapPin,
  Megaphone,
  Network,
  Newspaper,
  Plug,
  Receipt,
  ScanText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wand2,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { tr } from "@/lib/i18n";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Items marked `guided: true` are visible in Guided mode (the default
   * for new users). Items without the flag are Pro-only — they still
   * exist and are reachable by direct URL or via /tools, but the
   * sidebar hides them so beginners aren't drowning in 80 leaf nodes.
   *
   * The "Show all tools" footer toggle flips ui.mode from guided to pro
   * (or back). Settings → UI mode is the explicit knob.
   */
  guided?: boolean;
  /**
   * Opens in a new tab and is never treated as the current page.
   *
   * Exists for one entry: content writing moved out of this app into
   * BlogPilot. Silently deleting the Content section would have left
   * people hunting for a feature that used to be there, so it points at
   * where the feature went instead.
   */
  external?: boolean;
};

export type NavGroup = {
  id: string;
  title: string;
  /** Pinned groups are always visible and not collapsible. */
  pinned?: boolean;
  /** Default-expanded if true; otherwise collapsed by default. */
  defaultOpen?: boolean;
  items: NavItem[];
};


export const NAV_GROUPS: NavGroup[] = [
  {
    id: "essentials",
    title: tr("Essentials"),
    pinned: true,
    items: [
      { href: "/", label: tr("Dashboard"), icon: LayoutDashboard, guided: true },
      { href: "/welcome", label: tr("Get started"), icon: Sparkles, guided: true },
      { href: "/clients", label: tr("Clients"), icon: Users, guided: true },
      { href: "/seo-chat", label: tr("SEO chat"), icon: Bot, guided: true },
      { href: "/audits", label: tr("Audits"), icon: ClipboardList, guided: true },
      { href: "/tasks", label: tr("Tasks"), icon: ListChecks, guided: true },
      { href: "/tools", label: tr("All tools"), icon: Wrench, guided: true },
      { href: "/reports", label: tr("Reports"), icon: FileDown, guided: true },
    ],
  },
  {
    id: "everyday",
    title: tr("Everyday"),
    defaultOpen: false,
    items: [
      { href: "/morning", label: tr("Morning briefing"), icon: Activity, guided: true },
      { href: "/digest", label: tr("Weekly digest"), icon: Send },
      { href: "/grader", label: tr("Instant audit"), icon: Sparkles, guided: true },
      { href: "/leads", label: tr("Leads"), icon: Inbox, guided: true },
      { href: "/agent", label: tr("AI agent"), icon: Bot },
      // Guided, because "what is this thing doing to my sites while I'm
      // not looking" is a question a beginner needs answered more
      // urgently than an expert does — and the answer, including the
      // undo button, is on this page.
      { href: "/agent/autopilot", label: tr("Autopilot"), icon: ShieldCheck, guided: true },
      { href: "/capacity", label: tr("Capacity"), icon: Gauge },
      { href: "/activity", label: tr("Activity log"), icon: History },
    ],
  },
  {
    id: "content",
    title: tr("Content"),
    items: [
      // Writing lives in BlogPilot now — its own tool, MIT, self-hosted.
      // This app does technical SEO and applies fixes; drafting articles
      // is a different job with a different shape, and doing both badly
      // helped nobody.
      {
        href: "https://github.com/IamRamgarhia/BlogPilot-Open-Source-AI-SEO-Content-Studio",
        label: tr("Writing → BlogPilot"),
        icon: ExternalLink,
        guided: true,
        external: true,
      },
      { href: "/title-tests", label: tr("Title A/B tests"), icon: Wand2 },
      { href: "/meta-rewrite", label: tr("Meta rewrite batch"), icon: Wand2 },
    ],
  },
  {
    id: "keywords",
    title: tr("Keywords & ranks"),
    items: [
      { href: "/keywords", label: tr("Tracked keywords"), icon: Search, guided: true },
      { href: "/cannibalization", label: tr("Cannibalization"), icon: GitMerge },
      { href: "/cwv", label: tr("Core Web Vitals"), icon: Gauge },
      { href: "/serp-scans", label: tr("SERP scans archive"), icon: Globe },
    ],
  },
  {
    id: "paid-ads",
    title: tr("Paid ads"),
    defaultOpen: true,
    items: [
      // The ⭐ marks this as the newest / most-recommended entry —
      // matches the same treatment on /tools and the per-client launcher.
      {
        href: "/tools/ads-funnel",
        label: tr("Ad Funnel Architect ⭐"),
        icon: Megaphone,
      },
      { href: "/tools/branded-split", label: tr("Branded vs non-branded"), icon: Target },
    ],
  },
  {
    id: "backlinks",
    title: tr("Backlinks & outreach"),
    items: [
      { href: "/backlinks", label: tr("Backlinks"), icon: Link2, guided: true },
      { href: "/link-building", label: tr("Link building"), icon: Link2 },
      { href: "/outreach", label: tr("Outreach"), icon: Send },
      { href: "/broken-links", label: tr("Broken links"), icon: Link2 },
    ],
  },
  {
    id: "local",
    title: tr("Local SEO"),
    items: [
      { href: "/gbp", label: tr("Google Business Profile"), icon: Building, guided: true },
      { href: "/citations", label: tr("Citations"), icon: MapPin },
      { href: "/local-rank", label: tr("Local rank tracker"), icon: MapPin },
      { href: "/local-grid", label: tr("Local rank heatmap"), icon: MapPin },
    ],
  },
  {
    id: "competitors",
    title: tr("Competitors & brand"),
    items: [
      { href: "/competitors", label: tr("Competitors"), icon: Network },
      { href: "/brand-monitor", label: tr("Brand visibility"), icon: Network },
      { href: "/compare", label: tr("Site compare"), icon: GitCompare },
    ],
  },
  {
    id: "ai-visibility",
    title: tr("AI visibility"),
    items: [
      { href: "/ai-visibility", label: tr("AI visibility tracker"), icon: Sparkles },
      { href: "/chats", label: tr("AI chat history"), icon: Bot },
    ],
  },
  {
    id: "monitoring",
    title: tr("Monitoring + history"),
    items: [
      { href: "/monitor", label: tr("Page monitor"), icon: Activity },
      { href: "/snapshots", label: tr("Snapshots"), icon: ImageIcon },
      { href: "/history", label: tr("Tool run history"), icon: History },
      { href: "/algorithm-updates", label: tr("Algorithm updates"), icon: History },
      { href: "/news", label: tr("SEO news"), icon: Newspaper },
    ],
  },
  {
    id: "imports",
    title: tr("Imports"),
    items: [
      { href: "/import", label: tr("Import (all sources)"), icon: ScanText },
    ],
  },
  {
    id: "deliverables",
    title: tr("Deliverables"),
    items: [
      { href: "/reports/batch", label: tr("Generate all reports"), icon: FileStack, guided: true },
      { href: "/reports/archive", label: tr("Report archive"), icon: FileDown },
      { href: "/automations", label: tr("Automations"), icon: Workflow },
      { href: "/proposals", label: tr("Proposals"), icon: FileSignature, guided: true },
      { href: "/invoices", label: tr("Invoices"), icon: Receipt },
    ],
  },
  {
    id: "account",
    title: tr("Account"),
    pinned: true,
    items: [
      { href: "/connect", label: tr("Connect accounts"), icon: Plug, guided: true },
      { href: "/settings", label: tr("Settings"), icon: Settings, guided: true },
      { href: "/docs", label: tr("Docs"), icon: BookOpen, guided: true },
      { href: "/learn", label: tr("Learn"), icon: GraduationCap, guided: true },
      { href: "/knowledge", label: tr("Knowledge hub"), icon: GraduationCap },
    ],
  },
];

/** Every nav item, flattened — used by the mobile drawer's filter. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
