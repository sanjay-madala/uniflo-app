"use client";

import { useState, useMemo, useCallback } from "react";
import { Modal, Button, Input, Checkbox } from "@uniflo/ui";
import { regions as allRegions } from "@uniflo/mock-data";
import type { BroadcastAudience, Region, Zone, Store } from "@uniflo/mock-data";
import { ChevronDown, ChevronRight, Users } from "lucide-react";

interface AudienceSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: BroadcastAudience | null;
  onApply: (audience: BroadcastAudience) => void;
}

type CheckState = "checked" | "unchecked" | "indeterminate";

export function AudienceSelector({ open, onOpenChange, value, onApply }: AudienceSelectorProps) {
  const [selectedStores, setSelectedStores] = useState<Set<string>>(() => {
    if (value && value.store_ids.length > 0) return new Set(value.store_ids);
    // If region_ids are set, auto-expand to all stores in those regions
    if (value && value.region_ids.length > 0) {
      const storeIds = new Set<string>();
      for (const region of allRegions) {
        if (value.region_ids.includes(region.id)) {
          for (const zone of region.zones) {
            for (const store of zone.stores) {
              storeIds.add(store.id);
            }
          }
        }
      }
      return storeIds;
    }
    return new Set<string>();
  });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    () => new Set(allRegions.map((r) => r.id))
  );
  const [searchQuery, setSearchQuery] = useState("");

  const allStoreIds = useMemo(() => {
    const ids: string[] = [];
    for (const region of allRegions) {
      for (const zone of region.zones) {
        for (const store of zone.stores) {
          ids.push(store.id);
        }
      }
    }
    return ids;
  }, []);

  const totalRecipients = useMemo(() => {
    let count = 0;
    for (const region of allRegions) {
      for (const zone of region.zones) {
        for (const store of zone.stores) {
          if (selectedStores.has(store.id)) {
            count += store.staff_count;
          }
        }
      }
    }
    return count;
  }, [selectedStores]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getZoneStoreIds = useCallback((zone: Zone) => zone.stores.map((s) => s.id), []);

  const getRegionStoreIds = useCallback(
    (region: Region) => region.zones.flatMap((z) => getZoneStoreIds(z)),
    [getZoneStoreIds]
  );

  const getCheckState = useCallback(
    (storeIds: string[]): CheckState => {
      const checkedCount = storeIds.filter((id) => selectedStores.has(id)).length;
      if (checkedCount === 0) return "unchecked";
      if (checkedCount === storeIds.length) return "checked";
      return "indeterminate";
    },
    [selectedStores]
  );

  const toggleStores = (storeIds: string[]) => {
    setSelectedStores((prev) => {
      const next = new Set(prev);
      const allSelected = storeIds.every((id) => next.has(id));
      if (allSelected) {
        storeIds.forEach((id) => next.delete(id));
      } else {
        storeIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allSelected = allStoreIds.every((id) => selectedStores.has(id));
    if (allSelected) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(allStoreIds));
    }
  };

  const handleClearAll = () => {
    setSelectedStores(new Set());
  };

  const handleApply = () => {
    const regionIds: string[] = [];
    const zoneIds: string[] = [];
    const storeIds: string[] = [];

    for (const region of allRegions) {
      const rStoreIds = getRegionStoreIds(region);
      const regionState = getCheckState(rStoreIds);
      if (regionState === "checked") {
        regionIds.push(region.id);
      } else if (regionState === "indeterminate") {
        for (const zone of region.zones) {
          const zStoreIds = getZoneStoreIds(zone);
          const zoneState = getCheckState(zStoreIds);
          if (zoneState === "checked") {
            zoneIds.push(zone.id);
          } else if (zoneState === "indeterminate") {
            zStoreIds.filter((id) => selectedStores.has(id)).forEach((id) => storeIds.push(id));
          }
        }
      }
    }

    onApply({
      region_ids: regionIds,
      zone_ids: zoneIds,
      store_ids: storeIds,
      role_ids: [],
      total_recipients: totalRecipients,
    });
    onOpenChange(false);
  };

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return allRegions;
    const q = searchQuery.toLowerCase();
    return allRegions
      .map((region) => ({
        ...region,
        zones: region.zones
          .map((zone) => ({
            ...zone,
            stores: zone.stores.filter((store) => store.name.toLowerCase().includes(q)),
          }))
          .filter((zone) => zone.stores.length > 0 || zone.name.toLowerCase().includes(q)),
      }))
      .filter(
        (region) =>
          region.zones.length > 0 || region.name.toLowerCase().includes(q)
      );
  }, [searchQuery]);

  const getStaffCount = (stores: Store[]) =>
    stores.reduce((sum, s) => sum + s.staff_count, 0);

  const selectAllState = getCheckState(allStoreIds);

  // Compute selection summary
  const selectionSummary = useMemo(() => {
    const items: { region: string; zones: { name: string; detail: string }[] }[] = [];
    for (const region of allRegions) {
      const rStoreIds = getRegionStoreIds(region);
      const regionState = getCheckState(rStoreIds);
      if (regionState === "unchecked") continue;

      const zoneItems: { name: string; detail: string }[] = [];
      for (const zone of region.zones) {
        const zStoreIds = getZoneStoreIds(zone);
        const zoneState = getCheckState(zStoreIds);
        if (zoneState === "checked") {
          zoneItems.push({ name: zone.name, detail: "all" });
        } else if (zoneState === "indeterminate") {
          const count = zStoreIds.filter((id) => selectedStores.has(id)).length;
          zoneItems.push({ name: zone.name, detail: `${count} of ${zStoreIds.length}` });
        }
      }
      if (zoneItems.length > 0) {
        items.push({ region: region.name, zones: zoneItems });
      }
    }
    return items;
  }, [selectedStores, getCheckState, getRegionStoreIds, getZoneStoreIds]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Select Audience"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {selectedStores.size > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-[var(--text-secondary)] hover:text-[var(--accent-red)]">
                Clear All
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {totalRecipients} recipients
            </span>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={selectedStores.size === 0}>
              Apply
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Filter locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-4 max-h-[400px]">
          {/* Left: Tree */}
          <div className="flex-[3] overflow-y-auto pr-2">
            {/* Select All */}
            <div className="flex items-center gap-2 py-1.5 border-b border-[var(--border-default)] mb-2">
              <Checkbox
                checked={selectAllState === "checked"}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Select All ({allStoreIds.length} stores)
              </span>
            </div>

            {filteredRegions.map((region) => {
              const rStoreIds = getRegionStoreIds(region);
              const regionState = getCheckState(rStoreIds);
              const isExpanded = expandedNodes.has(region.id);

              return (
                <div key={region.id} className="mb-1">
                  <div className="flex items-center gap-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(region.id)}
                      className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    <Checkbox
                      checked={regionState === "checked"}
                      onCheckedChange={() => toggleStores(rStoreIds)}
                    />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{region.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      ({getStaffCount(region.zones.flatMap((z) => z.stores))} staff)
                    </span>
                  </div>

                  {isExpanded &&
                    region.zones.map((zone) => {
                      const zStoreIds = getZoneStoreIds(zone);
                      const zoneState = getCheckState(zStoreIds);
                      const zoneExpanded = expandedNodes.has(zone.id);

                      return (
                        <div key={zone.id} className="ml-6 mb-0.5">
                          <div className="flex items-center gap-1.5 py-1">
                            <button
                              type="button"
                              onClick={() => toggleExpand(zone.id)}
                              className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                              {zoneExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </button>
                            <Checkbox
                              checked={zoneState === "checked"}
                              onCheckedChange={() => toggleStores(zStoreIds)}
                            />
                            <span className="text-sm text-[var(--text-primary)]">{zone.name}</span>
                            <span className="text-xs text-[var(--text-secondary)]">
                              ({getStaffCount(zone.stores)} staff)
                            </span>
                          </div>

                          {zoneExpanded &&
                            zone.stores.map((store) => (
                              <div key={store.id} className="ml-6 flex items-center gap-1.5 py-1">
                                <div className="w-4" />
                                <Checkbox
                                  checked={selectedStores.has(store.id)}
                                  onCheckedChange={() => toggleStores([store.id])}
                                />
                                <span className="text-sm text-[var(--text-primary)]">{store.name}</span>
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {store.staff_count} staff
                                </span>
                              </div>
                            ))}
                        </div>
                      );
                    })}
                </div>
              );
            })}

            {filteredRegions.length === 0 && (
              <div className="text-sm text-[var(--text-muted)] py-4 text-center">
                No locations match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="flex-[2] border-l border-[var(--border-default)] pl-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-[var(--accent-blue)]" />
              <span className="text-2xl font-bold text-[var(--accent-blue)]">{totalRecipients}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">Recipients</p>

            {selectionSummary.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase">Selected</p>
                {selectionSummary.map((item) => (
                  <div key={item.region}>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.region}</p>
                    {item.zones.map((z) => (
                      <p key={z.name} className="text-xs text-[var(--text-secondary)] ml-3">
                        {z.name} ({z.detail})
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No locations selected</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
