"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Drawer, IconButton } from "@mui/material";
import type { Usuario } from "../../interfaces/usuario";
import {
  UsuarioForm,
  type UsuarioFormMode,
  type UsuarioFormSubmitValues,
} from "../usuario-form/usuario-form";
import styles from "./usuario-form-drawer.module.css";

export interface UsuarioFormDrawerProps {
  open: boolean;
  mode: UsuarioFormMode;
  usuario?: Usuario | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (values: UsuarioFormSubmitValues) => void | Promise<void>;
}

export function UsuarioFormDrawer({
  open,
  mode,
  usuario,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: UsuarioFormDrawerProps) {
  const title = mode === "create" ? "Adicionar usuário" : "Editar usuário";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: styles.drawer,
        },
      }}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <GroupOutlinedIcon className={styles.titleIcon} />
          <h2>{title}</h2>
        </div>
        <IconButton aria-label="Fechar painel" onClick={onClose}>
          <ArrowForwardIcon />
        </IconButton>
      </div>

      <div className={styles.content}>
        <UsuarioForm
          mode={mode}
          usuario={usuario}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </Drawer>
  );
}

export default UsuarioFormDrawer;
