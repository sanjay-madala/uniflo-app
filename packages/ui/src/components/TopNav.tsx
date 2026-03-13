"use client";

import * as React from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

export interface TopNavOrg {
  id: string;
  name: string;
  logo?: string;
}

export interface TopNavUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface TopNavProps {
  orgs?: TopNavOrg[];
  currentOrg?: TopNavOrg;
  onOrgChange?: (org: TopNavOrg) => void;
  user?: TopNavUser;
  onSearchChange?: (value: string) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onUserMenuClick?: () => void;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function TopNav({
  orgs,
  currentOrg,
  onOrgChange,
  user,
  onSearchChange,
  notificationCount = 0,
  onNotificationClick,
  onUserMenuClick,
  className,
  dir = "ltr",
}: TopNavProps) {
  const [showOrgMenu, setShowOrgMenu] = React.useState(false);

  return (
    <header
      dir={dir}
      className={cn(
        "h-14 flex items-center gap-4 px-4 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]",
        className
      )}
    >
      {/* Org switcher */}
      {currentOrg && (
        <div className="relative">
          <button
            onClick={() => setShowOrgMenu((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] transition-colors"
            aria-haspopup="listbox"
            aria-expanded={showOrgMenu}
          >
            <span className="font-medium truncate max-w-[120px]">{currentOrg.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
          </button>
          {showOrgMenu && orgs && (
            <div className="absolute top-full mt-1 start-0 z-50 min-w-[160px] rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-lg py-1">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-start hover:bg-[var(--bg-tertiary)] transition-colors",
                    org.id === currentOrg.id ? "text-[var(--accent-blue)]" : "text-[var(--text-primary)]"
                  )}
                  onClick={() => { onOrgChange?.(org); setShowOrgMenu(false); }}
                >
                  {org.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="search"
          placeholder="Search…"
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full h-8 ps-9 pe-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
        />
      </div>

      <div className="ms-auto flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 end-1 h-4 w-4 flex items-center justify-center rounded-full bg-[var(--accent-blue)] text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        {user && (
          <button
            onClick={onUserMenuClick}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label={`User menu for ${user.name}`}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-[10px]">
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
          </button>
        )}
      </div>
    </header>
  );
}
