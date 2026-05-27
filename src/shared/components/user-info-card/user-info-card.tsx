"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { JwtPayload } from "@/modules/auth/interfaces/jwt-payload";
import { logout } from "@/modules/auth/libs/auth";
import styles from "./user-info-card.module.css";
import { roleLabelByPerfil } from "@/modules/usuario/utils/perfil-role-label";
import { getInitials } from "@/modules/usuario/utils/user-get-initials";

interface UserInfoCardProps {
  payload: JwtPayload;
}

export function UserInfoCard({ payload }: UserInfoCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = payload.nomeSocial || payload.nome;
  const roleLabel = roleLabelByPerfil[payload.perfil];
  const initials = getInitials(displayName) || "U";

  function handleLogout() {
    logout();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.userText}>
          <span className={styles.greeting}>Olá, {displayName}</span>
          <span className={styles.role}>{roleLabel}</span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={handleLogout}
          >
            Logoff
          </button>
        </div>
      ) : null}
    </div>
  );
}
