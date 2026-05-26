"use client";

import { useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import styles from "./content-header.module.css";

export interface ContentHeaderProps {
  title?: string;
  icon?: ReactNode;
}

export const ContentHeader = ({ title, icon }: ContentHeaderProps) => {
  const theme = useTheme();

  return (
    <div
      className={styles.contentHeader}
      style={
        {
          "--content-header-icon-color": theme.palette.neutral.dark,
          "--content-header-title-color": theme.palette.text.primary,
          "--content-header-accent": theme.palette.primary.main,
        } as React.CSSProperties
      }
    >
      {icon ? (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      ) : null}
      {title ? <h1 className={styles.title}>{title}</h1> : null}
    </div>
  );
};
