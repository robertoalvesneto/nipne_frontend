"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { Button, Drawer, IconButton, Switch } from "@mui/material";
import { formatDatePtBr } from "@/shared/utils/format-date";
import type { DisciplinaOferta } from "../../interfaces/disciplina-oferta";
import styles from "./disciplina-details-drawer.module.css";

export interface DisciplinaDetailsDrawerProps {
  open: boolean;
  disciplina?: DisciplinaOferta | null;
  onClose: () => void;
  onEdit: (disciplina: DisciplinaOferta) => void;
}

function getProfessorText(disciplina: DisciplinaOferta) {
  return (
    disciplina.professores
      .map(
        (professor) =>
          professor.pessoaInstitucional.nomeSocial?.trim() ||
          professor.pessoaInstitucional.nome,
      )
      .join(", ") || "-"
  );
}

function getPeriodoAnoMes(disciplina: DisciplinaOferta) {
  const date = new Date(disciplina.periodoLetivo.dataInicio);

  if (Number.isNaN(date.getTime())) {
    return disciplina.periodoLetivo.nome;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

export function DisciplinaDetailsDrawer({
  open,
  disciplina,
  onClose,
  onEdit,
}: DisciplinaDetailsDrawerProps) {
  const statusAtivo = disciplina?.ativo ?? true;

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
      {disciplina ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <MenuBookRoundedIcon className={styles.titleIcon} />
              <h2>
                {disciplina.disciplina.nome}{" "}
                <span>(ID: {disciplina.id.slice(0, 8)})</span>
              </h2>
            </div>
            <IconButton aria-label="Fechar detalhes" onClick={onClose}>
              <ArrowForwardIcon />
            </IconButton>
          </div>

          <div className={styles.content}>
            <section className={styles.statusSection} aria-label="Status">
              <strong>Status</strong>
              <div className={styles.statusControl}>
                <Switch
                  color="success"
                  checked={statusAtivo}
                  readOnly
                  size="small"
                />
                <span>{statusAtivo ? "Ativo" : "Inativo"}</span>
              </div>
            </section>

            <dl className={styles.detailsGrid}>
              <div>
                <dt>Nome</dt>
                <dd>{disciplina.disciplina.nome}</dd>
              </div>
              <div>
                <dt>Código</dt>
                <dd>{disciplina.sigla}</dd>
              </div>
              <div>
                <dt>Professor</dt>
                <dd>{getProfessorText(disciplina)}</dd>
              </div>
              <div>
                <dt>Período letivo</dt>
                <dd>
                  {getPeriodoAnoMes(disciplina)} - {disciplina.periodoLetivo.nome}
                </dd>
              </div>
              <div>
                <dt>Matriculados</dt>
                <dd>{disciplina.matriculados}</dd>
              </div>
              <div>
                <dt>Carga horária</dt>
                <dd>{disciplina.disciplina.cargaHoraria}h</dd>
              </div>
              <div>
                <dt>Curso</dt>
                <dd>{disciplina.disciplina.curso.nome}</dd>
              </div>
              <div>
                <dt>Unidade acadêmica</dt>
                <dd>
                  {disciplina.disciplina.curso.unidadeAcademica.sigla} -{" "}
                  {disciplina.disciplina.curso.unidadeAcademica.nome}
                </dd>
              </div>
              <div>
                <dt>Cadastro</dt>
                <dd>{formatDatePtBr(disciplina.createdAt) || "-"}</dd>
              </div>
              <div>
                <dt>Última atualização</dt>
                <dd>{formatDatePtBr(disciplina.updatedAt) || "-"}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.footer}>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => onEdit(disciplina)}
            >
              Editar
            </Button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export default DisciplinaDetailsDrawer;
