// template.tsx re-mounts on every navigation (unlike layout.tsx which persists),
// so wrapping the page here gives each route a subtle fade-rise entrance. Only
// the page content animates — the header/footer live in layout.tsx and stay put.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>
}
