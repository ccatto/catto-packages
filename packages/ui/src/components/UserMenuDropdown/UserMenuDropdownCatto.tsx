// @ccatto/ui - UserMenuDropdownCatto Component
// Header user menu: avatar + name button → dropdown with custom links + sign-out
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import AvatarCatto from "../Avatar/AvatarCatto";
import { cn } from "../../utils";

export interface UserMenuLink {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface UserMenuUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface UserMenuDropdownCattoProps {
  /** Authenticated user — shapes the trigger (avatar + name) and menu header. */
  user: UserMenuUser;
  /** Menu items rendered above the sign-out divider. */
  links?: UserMenuLink[];
  /** Sign-out item label. Defaults to "Sign out". */
  signOutLabel?: string;
  /** Called when the user picks the sign-out item. */
  onSignOut: () => void | Promise<void>;
  /**
   * Called when a link is picked. Receives the link's href so the consumer
   * can route through next-intl's locale-aware router (or any other router).
   * If omitted, links render as plain `<a>` tags.
   */
  onNavigate?: (href: string) => void;
  /** Additional class for the outermost wrapper. */
  className?: string;
}

/**
 * Click-outside-to-close + ESC-to-close dropdown anchored to a user trigger.
 * Bring-your-own-router via `onNavigate` so the same component works under
 * next-intl, react-router, or plain anchors.
 */
const UserMenuDropdownCatto = ({
  user,
  links = [],
  signOutLabel = "Sign out",
  onSignOut,
  onNavigate,
  className,
}: UserMenuDropdownCattoProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = user.name?.trim() || user.email || "";

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800"
      >
        <AvatarCatto
          src={user.image ?? undefined}
          name={user.name ?? undefined}
          alt={displayName}
          size="sm"
        />
        {displayName && (
          <span className="hidden text-sm font-medium text-gray-900 sm:inline dark:text-gray-50">
            {displayName}
          </span>
        )}
        <svg
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform dark:text-gray-400",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 20 20"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 8l4 4 4-4"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {(user.name || user.email) && (
            <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              {user.name && (
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                  {user.name}
                </p>
              )}
              {user.email && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              )}
            </div>
          )}

          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              role="menuitem"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {link.icon}
              {link.label}
            </a>
          ))}

          {links.length > 0 && (
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
          )}

          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await onSignOut();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {signOutLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenuDropdownCatto;
