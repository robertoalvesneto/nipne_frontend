"use client";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  Alert,
  Button,
  Dialog,
  IconButton,
  LinearProgress,
} from "@mui/material";
import type { ChangeEvent } from "react";
import styles from "./disciplina-import-dialog.module.css";

export interface DisciplinaImportDialogProps {
  open: boolean;
  isImporting?: boolean;
  errorMessage?: string;
  fileName?: string;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
  onImport: () => void | Promise<void>;
}

export function DisciplinaImportDialog({
  open,
  isImporting = false,
  errorMessage,
  fileName,
  onClose,
  onFileChange,
  onImport,
}: DisciplinaImportDialogProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  return (
    <Dialog
      open={open}
      onClose={isImporting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          className: styles.dialog,
        },
      }}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <ReportGmailerrorredOutlinedIcon className={styles.warningIcon} />
          <h2>Atenção</h2>
        </div>
        <IconButton
          aria-label="Fechar importação"
          onClick={onClose}
          disabled={isImporting}
        >
          <CloseIcon />
        </IconButton>
      </div>

      <div className={styles.content}>
        <p>
          Para importar disciplinas para o sistema, selecione um arquivo no
          formato .csv.
        </p>
        <p className={styles.hint}>
          O arquivo deve conter nome, codigo, cargaHoraria, cursoSigla,
          periodo e professor.
        </p>

        <div className={styles.fileBox}>
          <CloudUploadOutlinedIcon />
          <span>{fileName || "Nenhum arquivo selecionado"}</span>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            disabled={isImporting}
          >
            Selecionar arquivo
            <input
              type="file"
              hidden
              accept=".csv,text/csv"
              onChange={handleFileChange}
            />
          </Button>
        </div>

        {isImporting ? <LinearProgress /> : null}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      </div>

      <div className={styles.actions}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onImport} disabled={isImporting}>
          {isImporting ? "Importando..." : "Importar"}
        </Button>
      </div>
    </Dialog>
  );
}

export default DisciplinaImportDialog;
