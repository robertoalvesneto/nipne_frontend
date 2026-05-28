"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { useEffect, type ReactNode } from "react";
import { Table, type TableColumn } from "@/shared/components/table/table";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useStudents } from "../../hooks/use-get-students";
import type { StudentListItem } from "../../interfaces/student";
import type { StudentsListQueryApiDto } from "../../services/get-students-service";
import styles from "./alunos-table.module.css";

export interface StudentsPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AlunosTableProps {
  filters?: StudentsListQueryApiDto;
  searchTerm?: string;
  actionLabel?: ReactNode;
  onMetaChange?: (meta?: StudentsPaginationMeta) => void;
  onViewAluno?: (aluno: StudentListItem) => void;
  onEditAluno?: (aluno: StudentListItem) => void;
}

type AlunoTableRow = StudentListItem & {
  onAlunoClick?: (aluno: StudentListItem) => void;
};

function getAlunoNome(aluno: StudentListItem) {
  return (
    aluno.pessoaInstitucional.nomeSocial?.trim() ||
    aluno.pessoaInstitucional.nome
  );
}

function getMatricula(aluno: StudentListItem) {
  return aluno.cursoAtual?.matricula || aluno.pessoaInstitucional.matricula;
}

const columns: TableColumn<AlunoTableRow>[] = [
  {
    key: "id",
    header: "ID",
    width: "8%",
    render: (aluno) => (
      <span className={styles.idText}>{aluno.id.slice(0, 8)}</span>
    ),
  },
  {
    key: "nome",
    header: "Nome",
    width: "17%",
    render: (aluno) =>
      aluno.onAlunoClick ? (
        <button
          className={styles.alunoButton}
          type="button"
          onClick={() => aluno.onAlunoClick?.(aluno)}
        >
          {getAlunoNome(aluno)}
        </button>
      ) : (
        <span className={styles.alunoText}>{getAlunoNome(aluno)}</span>
      ),
  },
  {
    key: "emailInstitucional",
    header: "E-mail",
    width: "20%",
    render: (aluno) => aluno.pessoaInstitucional.emailInstitucional,
  },
  {
    key: "curso",
    header: "Curso",
    width: "18%",
    render: (aluno) => aluno.cursoAtual?.nome ?? "-",
  },
  {
    key: "matricula",
    header: "Matrícula",
    width: "12%",
    render: (aluno) => getMatricula(aluno),
  },
  {
    key: "periodo",
    header: "Período",
    width: "8%",
    render: (aluno) => aluno.cursoAtual?.periodoLetivoAtual?.nome ?? "-",
  },
  {
    key: "qtdMaterias",
    header: "Qntd Matérias",
    width: "10%",
    render: (aluno) => aluno.cursoAtual?.quantidadeMaterias ?? 0,
  },
  {
    key: "ativo",
    header: "Status",
    width: "8%",
    render: (aluno) => (
      <span className={aluno.ativo ? styles.activeStatus : styles.inactiveStatus}>
        {aluno.ativo ? "Ativo" : "Inativo"}
      </span>
    ),
  },
];

export function AlunosTable({
  filters = {},
  searchTerm = "",
  onMetaChange,
  onViewAluno,
  onEditAluno,
}: AlunosTableProps) {
  const studentsQuery = useStudents(filters);
  const alunos = studentsQuery.data?.data ?? [];
  const normalizedSearchTerm = normalizeText(searchTerm);

  useEffect(() => {
    onMetaChange?.(studentsQuery.data?.meta);
  }, [onMetaChange, studentsQuery.data?.meta]);

  const rows: AlunoTableRow[] = alunos
    .filter((aluno) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      const searchableText = [
        aluno.pessoaInstitucional.nome,
        aluno.pessoaInstitucional.nomeSocial,
        aluno.pessoaInstitucional.emailInstitucional,
        aluno.pessoaInstitucional.matricula,
        aluno.cursoAtual?.nome,
        aluno.cursoAtual?.sigla,
        aluno.cursoAtual?.matricula,
        aluno.unidadeAcademica.nome,
        aluno.unidadeAcademica.sigla,
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(searchableText).includes(normalizedSearchTerm);
    })
    .map((aluno) => ({
      ...aluno,
      onAlunoClick: onViewAluno,
    }));

  return (
    <Table
      ariaLabel="Tabela de alunos"
      columns={columns}
      data={rows}
      emptyMessage={
        searchTerm
          ? "Nenhum aluno encontrado para o filtro informado."
          : "Nenhum aluno encontrado."
      }
      getRowKey={(aluno) => aluno.id}
      isLoading={studentsQuery.isLoading}
      loadingMessage="Carregando alunos..."
      actions={
        onViewAluno || onEditAluno
          ? (aluno) => (
              <div className={styles.actionGroup}>
                {onViewAluno ? (
                  <Tooltip title="Visualizar aluno">
                    <IconButton
                      aria-label={`Visualizar ${getAlunoNome(aluno)}`}
                      className={styles.iconButton}
                      onClick={() => onViewAluno(aluno)}
                      size="small"
                      type="button"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
                {onEditAluno ? (
                  <Tooltip title="Editar aluno">
                    <IconButton
                      aria-label={`Editar ${getAlunoNome(aluno)}`}
                      className={styles.iconButton}
                      onClick={() => onEditAluno(aluno)}
                      size="small"
                      type="button"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </div>
            )
          : undefined
      }
    />
  );
}

export default AlunosTable;
