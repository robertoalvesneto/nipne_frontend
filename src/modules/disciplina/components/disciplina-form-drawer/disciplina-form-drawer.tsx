"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { Drawer, IconButton } from "@mui/material";
import type { DisciplinaOferta } from "../../interfaces/disciplina-oferta";
import {
  DisciplinaForm,
  type DisciplinaFormMode,
  type DisciplinaFormSubmitValues,
} from "../disciplina-form/disciplina-form";
import styles from "./disciplina-form-drawer.module.css";

export interface DisciplinaFormDrawerProps {
  open: boolean;
  mode: DisciplinaFormMode;
  disciplina?: DisciplinaOferta | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (values: DisciplinaFormSubmitValues) => void | Promise<void>;
}

export function DisciplinaFormDrawer({
  open,
  mode,
  disciplina,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: DisciplinaFormDrawerProps) {
  const title =
    mode === "create" ? "Adicionar Disciplina" : "Editar Disciplina";

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
          <MenuBookRoundedIcon className={styles.titleIcon} />
          <h2>{title}</h2>
        </div>
        <IconButton aria-label="Fechar painel" onClick={onClose}>
          <ArrowForwardIcon />
        </IconButton>
      </div>

      <div className={styles.content}>
        <DisciplinaForm
          mode={mode}
          disciplina={disciplina}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </Drawer>
  );
}

export default DisciplinaFormDrawer;
