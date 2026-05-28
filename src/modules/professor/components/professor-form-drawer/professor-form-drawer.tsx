"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { Drawer, IconButton } from "@mui/material";
import type { Professor } from "../../interfaces/professor";
import {
  ProfessorForm,
  type ProfessorFormMode,
  type ProfessorFormSubmitValues,
} from "../professor-form/professor-form";
import styles from "./professor-form-drawer.module.css";

export interface ProfessorFormDrawerProps {
  open: boolean;
  mode: ProfessorFormMode;
  professor?: Professor | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (values: ProfessorFormSubmitValues) => void | Promise<void>;
}

export function ProfessorFormDrawer({
  open,
  mode,
  professor,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: ProfessorFormDrawerProps) {
  const title =
    mode === "create" ? "Adicionar professor" : "Editar professor";

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
          <SchoolOutlinedIcon className={styles.titleIcon} />
          <h2>{title}</h2>
        </div>
        <IconButton aria-label="Fechar painel" onClick={onClose}>
          <ArrowForwardIcon />
        </IconButton>
      </div>

      <div className={styles.content}>
        <ProfessorForm
          mode={mode}
          professor={professor}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </Drawer>
  );
}

export default ProfessorFormDrawer;
