// Sidebar.js — categorized, searchable blueprint node palette.

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { NODE_CATALOG, NODE_SECTIONS } from '../lib/nodeCatalog';
import { PaletteItem } from './PaletteItem';

export const Sidebar = () => {
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (n) =>
      !q || n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    return NODE_SECTIONS.map((section) => ({
      section,
      items: NODE_CATALOG.filter((n) => n.section === section && match(n)),
    })).filter((s) => s.items.length > 0);
  }, [query]);

  return (
    <aside className="panel-surface relative z-20 flex flex-col w-64 shrink-0 border-r border-line">
      {/* section header */}
      <div className="px-4 py-2.5 border-b border-line">
        <div className="font-mono text-2xs tracking-[0.2em] text-faint">{'// NODE_LIBRARY'}</div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-line">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search nodes…"
            className="w-full h-9 pl-8 pr-3 bg-ink/70 border border-line font-mono text-xs text-paper
                       outline-none transition-colors placeholder:text-faint
                       focus:border-cyan/60 focus:ring-1 focus:ring-cyan/30"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-4">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <div className="flex items-center gap-2 px-1.5 mb-1.5">
              <span className="font-mono text-2xs font-medium uppercase tracking-[0.18em] text-cyan/80">
                {section}
              </span>
              <span className="flex-1 h-px bg-line" />
              <span className="font-mono text-2xs text-faint tabular-nums">{items.length}</span>
            </div>
            <div className="flex flex-col">
              {items.map((n) => (
                <PaletteItem key={n.type} {...n} />
              ))}
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <div className="px-2 font-mono text-xs text-faint">no match for “{query}”</div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-line font-mono text-2xs text-faint leading-relaxed">
        <span className="text-cyan/70">DRAG</span> a node to canvas, then wire the handles.
      </div>
    </aside>
  );
};
