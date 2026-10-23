import { DocsNav } from "@/components/docs-nav";
import registry from "@/registry.json";

const components = registry.items.filter((i) => i.type === "registry:ui").map((i) => i.name);

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 lg:grid-cols-[200px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8">
          <DocsNav components={components} />
        </div>
      </aside>
      {children}
    </div>
  );
}
