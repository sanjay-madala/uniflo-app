"use client";

import { useState, useMemo, useCallback } from "react";
import { Building2, MapPin, Store, ChevronRight, ChevronDown, X, Search } from "lucide-react";
import { Input } from "@uniflo/ui";
import type { LocationNode } from "@uniflo/mock-data";

interface DashboardLocationFilterProps {
  tree: LocationNode;
  selectedLocationId: string | null;
  onSelect: (id: string | null) => void;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  org: Building2,
  region: MapPin,
  zone: MapPin,
  city: MapPin,
  store: Store,
};

function getScoreColor(score: number): string {
  if (score >= 90) return "text-[var(--accent-green)]";
  if (score >= 75) return "text-yellow-400";
  return "text-[var(--accent-red)]";
}

function flattenNodes(node: LocationNode): LocationNode[] {
  const result: LocationNode[] = [node];
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenNodes(child));
    }
  }
  return result;
}

function findNode(node: LocationNode, id: string): LocationNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

function getBreadcrumb(tree: LocationNode, id: string): LocationNode[] {
  const path: LocationNode[] = [];
  function walk(node: LocationNode): boolean {
    if (node.id === id) {
      path.push(node);
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (walk(child)) {
          path.unshift(node);
          return true;
        }
      }
    }
    return false;
  }
  walk(tree);
  return path;
}

export function DashboardLocationFilter({ tree, selectedLocationId, onSelect }: DashboardLocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["org_001"]));

  const allNodes = useMemo(() => flattenNodes(tree), [tree]);

  const selectedNode = selectedLocationId ? findNode(tree, selectedLocationId) : null;
  const breadcrumb = selectedLocationId ? getBreadcrumb(tree, selectedLocationId) : [];

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    return allNodes.filter((n) => n.name.toLowerCase().includes(q));
  }, [searchQuery, allNodes]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    setIsOpen(false);
    setSearchQuery("");
  };

  const renderNode = (node: LocationNode, depth: number) => {
    const Icon = TYPE_ICONS[node.type] ?? Store;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedLocationId === node.id;

    return (
      <div key={node.id}>
        <button
          className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors rounded hover:bg-[var(--bg-tertiary)] ${
            isSelected ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]" : "text-[var(--text-primary)]"
          }`}
          style={{ paddingInlineStart: `${12 + depth * 16}px` }}
          onClick={() => {
            if (hasChildren) toggleExpand(node.id);
            handleSelect(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} className="shrink-0 text-[var(--text-muted)]" /> : <ChevronRight size={14} className="shrink-0 text-[var(--text-muted)]" />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <Icon size={14} className="shrink-0 text-[var(--text-secondary)]" />
          <span className="truncate flex-1 text-start">{node.name}</span>
          {node.metrics && (
            <span className={`text-xs font-medium shrink-0 ${getScoreColor(node.metrics.compliance_score)}`}>
              {node.metrics.compliance_score}%
            </span>
          )}
        </button>
        {hasChildren && isExpanded && node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors min-w-[200px]"
      >
        <Building2 size={14} className="text-[var(--text-secondary)]" />
        <span className="truncate">{selectedNode ? selectedNode.name : "All Locations"}</span>
        {selectedLocationId && (
          <span
            role="button"
            aria-label="Clear location filter"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(null);
            }}
            className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 z-50 mt-1 w-72 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-xl overflow-hidden">
            <div className="p-2 border-b border-[var(--border-default)]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                />
              </div>
            </div>

            {breadcrumb.length > 1 && !searchQuery && (
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border-default)] text-xs text-[var(--text-muted)]">
                {breadcrumb.map((node, i) => (
                  <span key={node.id} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={10} />}
                    <button
                      className="hover:text-[var(--accent-blue)] transition-colors"
                      onClick={() => handleSelect(node.id)}
                    >
                      {node.name}
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="max-h-72 overflow-y-auto py-1">
              <button
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-tertiary)] ${
                  !selectedLocationId ? "text-[var(--accent-blue)]" : "text-[var(--text-primary)]"
                }`}
                onClick={() => handleSelect(null)}
              >
                <Building2 size={14} className="shrink-0" />
                All Locations
              </button>

              {filteredNodes ? (
                filteredNodes.map((node) => {
                  const Icon = TYPE_ICONS[node.type] ?? Store;
                  return (
                    <button
                      key={node.id}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
                      onClick={() => handleSelect(node.id)}
                    >
                      <Icon size={14} className="shrink-0 text-[var(--text-secondary)]" />
                      <span className="truncate flex-1 text-start">{node.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{node.type}</span>
                      {node.metrics && (
                        <span className={`text-xs font-medium ${getScoreColor(node.metrics.compliance_score)}`}>
                          {node.metrics.compliance_score}%
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                renderNode(tree, 0)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
