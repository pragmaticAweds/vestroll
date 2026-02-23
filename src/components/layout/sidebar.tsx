"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Settings, LogOut, X } from "lucide-react";
import { ThemeToggle } from "../shared/theme-toggle";
import logoSet from "@/../public/LogoSet.png";

type NavItem = {
  name: string;
  href: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSrc?: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/app/dashboard", iconSrc: "/dashboard.svg" },
  { name: "Contracts", href: "/app/contracts", iconSrc: "/contracts.svg" },
  {
    name: "Team management",
    href: "/app/team-management",
    iconSrc: "/team.svg",
  },
  { name: "Finance", href: "/app/finance", iconSrc: "/wallet.svg" },
  { name: "Payroll", href: "/app/payroll", iconSrc: "/payroll.svg" },
  { name: "Invoices", href: "/app/invoices", iconSrc: "/invoice.svg" },
  { name: "Settings", href: "/app/settings", iconSrc: "/Settings.png" },
];

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const isActive = useMemo(
    () => (href: string) => {
      if (!isClient) return false;
      if (pathname === href) return true;
      return pathname?.startsWith(href + "/") ?? false;
    },
    [pathname, isClient],
  );

  const content = (
    <div className="flex flex-col h-full px-4 py-6">
      <div className="flex items-center justify-between px-2 mb-10">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="VestRoll home"
        >
          <Image src={logoSet} alt="VestRoll" />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="lg:hidden rounded-lg p-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d28d9]"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="mt-10 px-2 text-xs font-semibold tracking-wider text-[#6b7280]">
        MENU
      </div>

      <nav className="flex-1 mt-3" aria-label="Primary">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ name, href, Icon, iconSrc }) => {
            const active = isActive(href);
            const isSettings = href === "/settings";
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={classNames(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#6d28d9]",
                    active
                      ? "bg-[#5E2A8C] text-white shadow"
                      : "text-[#111827]/80 hover:bg-[#f5f3ff] hover:text-[#4c1d95]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {iconSrc ? (
                    <Image
                      src={iconSrc}
                      alt=""
                      width={20}
                      height={20}
                      className={classNames(
                        "shrink-0 transition",
                        active
                          ? "brightness-0 invert"
                          : "opacity-70 group-hover:opacity-100",
                      )}
                      aria-hidden="true"
                    />
                  ) : Icon ? (
                    <Icon
                      className={classNames(
                        "h-5 w-5 transition-colors",
                        active
                          ? "text-white"
                          : "text-[#6b7280] group-hover:text-[#4c1d95]",
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="truncate">{name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="-mx-4 border-t border-gray-300 mt-50">
          <div className="px-4 pt-3 space-y-2">
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm   text-[#b91c1c] hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span>Sign out</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );

  // Desktop sidebar
  return (
    <>
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-[#e5e7eb] lg:bg-white dark:lg:bg-gray-900 dark:lg:border-gray-800">
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center justify-between px-2 mb-10">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="VestRoll home"
            >
              <Image src={logoSet} alt="VestRoll" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d28d9] dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>

          <div className="mt-10 px-2 text-xs font-semibold tracking-wider text-[#6b7280] dark:text-gray-500">
            MENU
          </div>

          <nav className="flex-1 mt-3" aria-label="Primary">
            <ul className="flex flex-col gap-1">
              {navItems.map(({ name, href, Icon, iconSrc }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={classNames(
                        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#6d28d9]",
                        active
                          ? "bg-[#5E2A8C] text-white shadow"
                          : "text-[#111827]/80 hover:bg-[#f5f3ff] hover:text-[#4c1d95] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt=""
                          width={20}
                          height={20}
                          className={classNames(
                            "shrink-0 transition",
                            active
                              ? "brightness-0 invert"
                              : "opacity-70 group-hover:opacity-100 dark:invert",
                          )}
                          aria-hidden="true"
                        />
                      ) : Icon ? (
                        <Icon
                          className={classNames(
                            "h-5 w-5 transition-colors",
                            active
                              ? "text-white"
                              : "text-[#6b7280] group-hover:text-[#4c1d95] dark:text-gray-400 dark:group-hover:text-white",
                          )}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="truncate">{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="-mx-4 border-t border-gray-300 mt-50 dark:border-gray-800">
              <div className="px-4 pt-3">
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm   text-[#b91c1c] hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-900/20"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  <span>Sign out</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile overlay drawer */}
      <div
        className={classNames(
          "fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full border-r border-[#e5e7eb] bg-white shadow-xl transition-transform lg:hidden dark:bg-gray-900 dark:border-gray-800",
          mobileOpen && "translate-x-0",
        )}
        aria-label="Mobile sidebar"
      >
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center justify-between px-2 mb-10">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="VestRoll home"
            >
              <Image src={logoSet} alt="VestRoll" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d28d9] dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>

          <div className="mt-10 px-2 text-xs font-semibold tracking-wider text-[#6b7280] dark:text-gray-500">
            MENU
          </div>

          <nav className="flex-1 mt-3" aria-label="Primary">
            <ul className="flex flex-col gap-1">
              {navItems.map(({ name, href, Icon, iconSrc }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={classNames(
                        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#6d28d9]",
                        active
                          ? "bg-[#5E2A8C] text-white shadow"
                          : "text-[#111827]/80 hover:bg-[#f5f3ff] hover:text-[#4c1d95] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt=""
                          width={20}
                          height={20}
                          className={classNames(
                            "shrink-0 transition",
                            active
                              ? "brightness-0 invert"
                              : "opacity-70 group-hover:opacity-100 dark:invert",
                          )}
                          aria-hidden="true"
                        />
                      ) : Icon ? (
                        <Icon
                          className={classNames(
                            "h-5 w-5 transition-colors",
                            active
                              ? "text-white"
                              : "text-[#6b7280] group-hover:text-[#4c1d95] dark:text-gray-400 dark:group-hover:text-white",
                          )}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="truncate">{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="-mx-4 border-t border-gray-300 mt-50 dark:border-gray-800">
              <div className="px-4 pt-3 space-y-2">
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm   text-[#b91c1c] hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-900/20"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  <span>Sign out</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
