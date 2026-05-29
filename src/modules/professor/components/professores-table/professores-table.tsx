"use client";

import { useEffect, type ReactNode } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { Table, type TableColumn } from "@/shared/components/table/table";
import type { PaginatedResponseMeta } from "@/shared/types/paginated-response-type";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useProfessores } from "../../hooks/use-get-professores";
import type { Professor } from "../../interfaces/professor";
import type { ProfessoresListQueryApiDto } from "../../services/get-professores-service";
import styles from "./professores-table.module.css";

export interface ProfessoresTableProps {
  filters?: ProfessoresListQueryApiDto;
  searchTerm?: string;
  actionLabel?: ReactNode;
  renderAction?: (professor: Professor) => ReactNode;
  onActionClick?: (professor: Professor) => void;
  onMetaChange?: (meta?: PaginatedResponseMeta) => void;
  onViewProfessor?: (professor: Professor) => void;
  onEditProfessor?: (professor: Professor) => void;
}

type ProfessorTableRow = Professor & {
  onProfessorClick?: (professor: Professor) => void;
};

function getProfessorNome(professor: Professor) {
  return professor.pessoaInstitucional.nomeSocial?.trim() ||
    professor.pessoaInstitucional.nome;
}

function getAcademicUnitsText(professor: Professor) {
  return professor.unidadesAcademicas
    .map((unit) => unit.sigla)
    .filter(Boolean)
    .join(", ");
}

const columns: TableColumn<ProfessorTableRow>[] = [
  {
    key: "id",
    header: "ID",
    width: "10%",
    render: (professor) => (
      <span className={styles.idText}>{professor.id.slice(0, 8)}</span>
    ),
  },
  {
    key: "nome",
    header: "Nome",
    width: "24%",
    render: (professor) => {
      const nome = getProfessorNome(professor);

      return professor.onProfessorClick ? (
        <button
          className={styles.professorButton}
          type="button"
          onClick={() => professor.onProfessorClick?.(professor)}
        >
          {nome}
          {professor.pessoaInstitucional.nomeSocial ? (
            <span className={styles.secondaryText}>
              {professor.pessoaInstitucional.nome}
            </span>
          ) : null}
        </button>
      ) : (
        <span className={styles.professorText}>{nome}</span>
      );
    },
  },
  {
    key: "emailInstitucional",
    header: "E-mail",
    width: "24%",
    render: (professor) => professor.pessoaInstitucional.emailInstitucional,
  },
  {
    key: "matricula",
    header: "Matrícula",
    width: "12%",
    render: (professor) => professor.pessoaInstitucional.matricula,
  },
  {
    key: "unidadesAcademicas",
    header: "Unidades",
    width: "14%",
    render: (professor) => getAcademicUnitsText(professor) || "-",
  },
  {
    key: "createdAt",
    header: "Cadastro",
    width: "12%",
    render: (professor) => formatDatePtBr(professor.createdAt),
  },
  {
    key: "ativo",
    header: "Status",
    width: "10%",
    render: (professor) => (
      <span
        className={
          professor.ativo ? styles.activeStatus : styles.inactiveStatus
        }
      >
        {professor.ativo ? "Ativo" : "Inativo"}
      </span>
    ),
  },
];

export function ProfessoresTable({
  filters = {},
  searchTerm = "",
  actionLabel = "Ver",
  renderAction,
  onActionClick,
  onMetaChange,
  onViewProfessor,
  onEditProfessor,
}: ProfessoresTableProps) {
  const professoresQuery = useProfessores(filters);
  const professores = professoresQuery.data?.data ?? [];
  const normalizedSearchTerm = normalizeText(searchTerm);

  useEffect(() => {
    onMetaChange?.(professoresQuery.data?.meta);
  }, [onMetaChange, professoresQuery.data?.meta]);

  const rows: ProfessorTableRow[] = professores
    .filter((professor) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      const searchableText = [
        professor.pessoaInstitucional.nome,
        professor.pessoaInstitucional.nomeSocial,
        professor.pessoaInstitucional.emailInstitucional,
        professor.pessoaInstitucional.matricula,
        ...professor.unidadesAcademicas.flatMap((unit) => [
          unit.nome,
          unit.sigla,
        ]),
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(searchableText).includes(normalizedSearchTerm);
    })
    .map((professor) => ({
      ...professor,
      onProfessorClick: onViewProfessor,
    }));

  return (
    <Table
      ariaLabel="Tabela de professores"
      columns={columns}
      data={rows}
      emptyMessage={
        searchTerm
          ? "Nenhum professor encontrado para o filtro informado."
          : "Nenhum professor encontrado."
      }
      getRowKey={(professor) => professor.id}
      isLoading={professoresQuery.isLoading}
      loadingMessage="Carregando professores..."
      actions={
        renderAction || onActionClick || onViewProfessor || onEditProfessor
          ? (professor) =>
              renderAction ? (
                renderAction(professor)
              ) : onViewProfessor || onEditProfessor ? (
                <div className={styles.actionGroup}>
                  {onViewProfessor ? (
                    <Tooltip title="Visualizar professor">
                      <IconButton
                        aria-label={`Visualizar ${getProfessorNome(professor)}`}
                        className={styles.iconButton}
                        onClick={() => onViewProfessor(professor)}
                        size="small"
                        type="button"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {onEditProfessor ? (
                    <Tooltip title="Editar professor">
                      <IconButton
                        aria-label={`Editar ${getProfessorNome(professor)}`}
                        className={styles.iconButton}
                        onClick={() => onEditProfessor(professor)}
                        size="small"
                        type="button"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </div>
              ) : (
                <button
                  className={styles.actionButton}
                  type="button"
                  onClick={() => onActionClick?.(professor)}
                >
                  {actionLabel}
                </button>
              )
          : undefined
      }
    />
  );
}

export default ProfessoresTable;
