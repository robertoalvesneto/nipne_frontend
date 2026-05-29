"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { Drawer, IconButton } from "@mui/material";
import {
  AlunoForm,
  type AlunoFormInitialValues,
  type AlunoFormMode,
  type AlunoFormSubmitValues,
} from "../aluno-form/aluno-form";
import styles from "./aluno-form-drawer.module.css";

export interface AlunoFormDrawerProps {
  open: boolean;
  mode?: AlunoFormMode;
  initialValues?: AlunoFormInitialValues;
  isLoading?: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (values: AlunoFormSubmitValues) => void | Promise<void>;
}

export function AlunoFormDrawer({
  open,
  mode = "create",
  initialValues,
  isLoading,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: AlunoFormDrawerProps) {
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
          <h2>{mode === "edit" ? "Editar aluno" : "Adicionar aluno"}</h2>
        </div>
        <IconButton aria-label="Fechar painel" onClick={onClose}>
          <ArrowForwardIcon />
        </IconButton>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <p className={styles.loadingText}>Carregando aluno...</p>
        ) : (
          <AlunoForm
            mode={mode}
            initialValues={initialValues}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onCancel={onClose}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </Drawer>
  );
}

export default AlunoFormDrawer;
