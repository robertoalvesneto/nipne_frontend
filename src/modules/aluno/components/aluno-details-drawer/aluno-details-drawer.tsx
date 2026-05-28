"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { Drawer, IconButton, Switch } from "@mui/material";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { useStudent } from "../../hooks/use-get-student";
import type { StudentListItem } from "../../interfaces/student";
import styles from "./aluno-details-drawer.module.css";

export interface AlunoDetailsDrawerProps {
  open: boolean;
  aluno?: StudentListItem | null;
  onClose: () => void;
}

function getAlunoNome(aluno: StudentListItem) {
  return (
    aluno.pessoaInstitucional.nomeSocial?.trim() ||
    aluno.pessoaInstitucional.nome
  );
}

export function AlunoDetailsDrawer({
  open,
  aluno,
  onClose,
}: AlunoDetailsDrawerProps) {
  const studentQuery = useStudent(open ? aluno?.id : undefined);
  const details = studentQuery.data;
  const telefonePreferencial =
    details?.contatosTelefonicos.find(
      (contact) => contact.formaPreferencialContato,
    ) ?? details?.contatosTelefonicos[0];
  const contatoApoio = details?.contatosApoio[0];

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
      {aluno ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <SchoolOutlinedIcon className={styles.titleIcon} />
              <h2>
                {getAlunoNome(aluno)} <span>(ID: {aluno.id.slice(0, 8)})</span>
              </h2>
            </div>
            <IconButton aria-label="Fechar detalhes" onClick={onClose}>
              <ArrowForwardIcon />
            </IconButton>
          </div>

          <div className={styles.tabs} aria-label="Seções do aluno">
            <span className={styles.activeTab}>Dados Gerais</span>
          </div>

          <div className={styles.content}>
            <section className={styles.statusSection} aria-label="Status">
              <strong>Status</strong>
              <div className={styles.statusControl}>
                <Switch
                  color="success"
                  checked={aluno.ativo}
                  readOnly
                  size="small"
                />
                <span>{aluno.ativo ? "Ativo" : "Inativo"}</span>
              </div>
            </section>

            <dl className={styles.detailsGrid}>
              <div>
                <dt>Nome</dt>
                <dd>{details?.pessoaInstitucional.nome ?? aluno.pessoaInstitucional.nome}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{aluno.pessoaInstitucional.emailInstitucional}</dd>
              </div>
              <div>
                <dt>Curso</dt>
                <dd>{aluno.cursoAtual?.nome ?? "-"}</dd>
              </div>
              <div>
                <dt>Unidade acadêmica</dt>
                <dd>
                  {aluno.unidadeAcademica.sigla} - {aluno.unidadeAcademica.nome}
                </dd>
              </div>
              <div>
                <dt>Matrícula</dt>
                <dd>{aluno.cursoAtual?.matricula ?? aluno.pessoaInstitucional.matricula}</dd>
              </div>
              <div>
                <dt>Data de nascimento</dt>
                <dd>{formatDatePtBr(details?.dataNascimento ?? aluno.dataNascimento) || "-"}</dd>
              </div>
              <div>
                <dt>Contato (WhatsApp)</dt>
                <dd>{telefonePreferencial?.telefone ?? "-"}</dd>
              </div>
              <div>
                <dt>Contato de apoio</dt>
                <dd>
                  {contatoApoio
                    ? `${contatoApoio.nome} - ${contatoApoio.telefone}`
                    : "-"}
                </dd>
              </div>
            </dl>

            {studentQuery.isLoading ? (
              <p className={styles.loadingText}>Carregando detalhes...</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export default AlunoDetailsDrawer;
