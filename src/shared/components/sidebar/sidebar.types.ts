import type { ReactNode } from "react";

export interface SidebarOption {
  name: string;
  path: string;
  icon: ReactNode;
  ariaLabel?: string;
}

export type SidebarOptions = SidebarOption[];
