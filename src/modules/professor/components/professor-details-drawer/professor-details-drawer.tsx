"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { Button, Drawer, IconButton, Switch } from "@mui/material";
import { formatDatePtBr } from "@/shared/utils/format-date";
import type { Professor } from "../../interfaces/professor";
import styles from "./professor-details-drawer.module.css";

export interface ProfessorDetailsDrawerProps {
  open: boolean;
  professor?: Professor | null;
  onClose: () => void;
  onEdit: (professor: Professor) => void;
}

function getProfessorNome(professor: Professor) {
  return professor.pessoaInstitucional.nomeSocial?.trim() ||
    professor.pessoaInstitucional.nome;
}

export function ProfessorDetailsDrawer({
  open,
  professor,
  onClose,
  onEdit,
}: ProfessorDetailsDrawerProps) {
  const statusAtivo = professor?.ativo ?? true;

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
      {professor ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <SchoolOutlinedIcon className={styles.titleIcon} />
              <h2>
                {getProfessorNome(professor)}{" "}
                <span>(ID: {professor.id.slice(0, 8)})</span>
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
                <dd>{professor.pessoaInstitucional.nome}</dd>
              </div>
              <div>
                <dt>Nome social</dt>
                <dd>{professor.pessoaInstitucional.nomeSocial || "-"}</dd>
              </div>
              <div>
                <dt>E-mail institucional</dt>
                <dd>{professor.pessoaInstitucional.emailInstitucional}</dd>
              </div>
              <div>
                <dt>Matrícula</dt>
                <dd>{professor.pessoaInstitucional.matricula}</dd>
              </div>
              <div>
                <dt>Cadastro</dt>
                <dd>{formatDatePtBr(professor.createdAt) || "-"}</dd>
              </div>
              <div>
                <dt>Última atualização</dt>
                <dd>{formatDatePtBr(professor.updatedAt) || "-"}</dd>
              </div>
            </dl>

            <section className={styles.unitsSection}>
              <strong>Unidades acadêmicas vinculadas</strong>
              {professor.unidadesAcademicas.length ? (
                <ul className={styles.unitList}>
                  {professor.unidadesAcademicas.map((unit) => (
                    <li key={unit.id}>
                      <span>{unit.sigla}</span>
                      {unit.nome}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma unidade acadêmica vinculada.</p>
              )}
            </section>
          </div>

          <div className={styles.footer}>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => onEdit(professor)}
            >
              Editar
            </Button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export default ProfessorDetailsDrawer;
