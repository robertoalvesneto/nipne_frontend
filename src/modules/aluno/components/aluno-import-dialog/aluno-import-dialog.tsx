"use client";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Button, Dialog, IconButton } from "@mui/material";
import type { ChangeEvent } from "react";
import styles from "./aluno-import-dialog.module.css";

export interface AlunoImportDialogProps {
  open: boolean;
  fileName?: string;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
  onImport: () => void;
}

export function AlunoImportDialog({
  open,
  fileName,
  onClose,
  onFileChange,
  onImport,
}: AlunoImportDialogProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        <IconButton aria-label="Fechar importação" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className={styles.content}>
        <p>
          Para importar alunos para o sistema, selecione um arquivo nos
          seguintes formatos: .csv, .xls
        </p>

        <div className={styles.fieldGroup}>
          <strong>Arquivo</strong>
          <Button
            component="label"
            className={styles.fileButton}
            variant="outlined"
            startIcon={<CloudUploadOutlinedIcon />}
          >
            {fileName || "Nenhum arquivo selecionado"}
            <input
              hidden
              type="file"
              accept=".csv,.xls,.xlsx,text/csv"
              onChange={handleFileChange}
            />
          </Button>
        </div>

        <p className={styles.warningText}>
          Os alunos serão adicionados ao sistema e não poderão ser excluídos,
          apenas inativados.
        </p>
      </div>

      <div className={styles.actions}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={onImport}
          disabled={!fileName}
        >
          Importar
        </Button>
      </div>
    </Dialog>
  );
}

export default AlunoImportDialog;
