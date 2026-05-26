"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarOptions } from "./sidebar.types";

import styles from "./sidebar.module.css";

export interface SidebarProps {
  mainOptions: SidebarOptions;
  sideOptions?: SidebarOptions;
  activePath?: string;
  logoAlt?: string;
  logoSrc?: string;
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, "").toLowerCase() || "/";
}

function isActivePath(currentPath: string, optionPath: string) {
  const normalizedCurrentPath = normalizePath(currentPath);
  const normalizedOptionPath = normalizePath(optionPath);

  if (normalizedOptionPath === "/") {
    return normalizedCurrentPath === normalizedOptionPath;
  }

  return (
    normalizedCurrentPath === normalizedOptionPath ||
    normalizedCurrentPath.startsWith(`${normalizedOptionPath}/`)
  );
}

export function Sidebar({
  mainOptions,
  sideOptions = [],
  activePath,
  logoAlt = "Logo UEA NIPNE",
  logoSrc = "/logo.svg",
}: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;

  const renderOptions = (options: SidebarOptions) =>
    options.map((option) => {
      const isActive = isActivePath(currentPath, option.path);

      return (
        <Link
          key={`${option.path}-${option.name}`}
          href={option.path}
          aria-current={isActive ? "page" : undefined}
          aria-label={option.ariaLabel ?? option.name}
          className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
        >
          <span className={styles.icon} aria-hidden="true">
            {option.icon}
          </span>
          <span className={styles.label}>{option.name}</span>
        </Link>
      );
    });

  return (
    <aside className={styles.sidebar} aria-label="Navegação principal">
      <div className={styles.logoWrapper}>
        <Image
          className={styles.logo}
          src={logoSrc}
          alt={logoAlt}
          width={88}
          height={88}
          priority
        />
      </div>

      <nav className={styles.mainNav}>{renderOptions(mainOptions)}</nav>

      {sideOptions.length ? (
        <nav className={styles.sideNav} aria-label="Ações secundárias">
          {renderOptions(sideOptions)}
        </nav>
      ) : null}
    </aside>
  );
}

export default Sidebar;
