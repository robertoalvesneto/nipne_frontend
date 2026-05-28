"use client";

import type { ReactNode } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { Table, type TableColumn } from "@/shared/components/table/table";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useClassGroups } from "../../hooks/use-get-class-groups";
import type { DisciplinaOferta } from "../../interfaces/disciplina-oferta";
import type { ClassGroupsListQueryApiDto } from "../../services/get-class-groups-service";
import styles from "./disciplinas-table.module.css";

export interface DisciplinasTableProps {
  filters?: ClassGroupsListQueryApiDto;
  searchTerm?: string;
  actionLabel?: ReactNode;
  renderAction?: (disciplina: DisciplinaOferta) => ReactNode;
  onActionClick?: (disciplina: DisciplinaOferta) => void;
  onViewDisciplina?: (disciplina: DisciplinaOferta) => void;
  onEditDisciplina?: (disciplina: DisciplinaOferta) => void;
}

type DisciplinaTableRow = DisciplinaOferta & {
  onDisciplinaClick?: (disciplina: DisciplinaOferta) => void;
};

function getProfessorText(disciplina: DisciplinaOferta) {
  const professores = disciplina.professores.map(
    (professor) =>
      professor.pessoaInstitucional.nomeSocial?.trim() ||
      professor.pessoaInstitucional.nome,
  );

  return professores.join(", ") || "-";
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

const columns: TableColumn<DisciplinaTableRow>[] = [
  {
    key: "id",
    header: "ID",
    width: "8%",
    render: (disciplina) => (
      <span className={styles.idText}>{disciplina.id.slice(0, 8)}</span>
    ),
  },
  {
    key: "nome",
    header: "Nome",
    width: "20%",
    render: (disciplina) =>
      disciplina.onDisciplinaClick ? (
        <button
          className={styles.disciplineButton}
          type="button"
          onClick={() => disciplina.onDisciplinaClick?.(disciplina)}
        >
          {disciplina.disciplina.nome}
        </button>
      ) : (
        <span className={styles.disciplineText}>
          {disciplina.disciplina.nome}
        </span>
      ),
  },
  {
    key: "codigo",
    header: "Código",
    width: "10%",
    render: (disciplina) => disciplina.sigla,
  },
  {
    key: "professor",
    header: "Professor",
    width: "20%",
    render: (disciplina) => getProfessorText(disciplina),
  },
  {
    key: "periodo",
    header: "Período",
    width: "10%",
    render: (disciplina) => getPeriodoAnoMes(disciplina),
  },
  {
    key: "matriculados",
    header: "Matriculados",
    width: "10%",
    render: (disciplina) => disciplina.matriculados,
  },
  {
    key: "ativo",
    header: "Status",
    width: "10%",
    render: (disciplina) => (
      <span
        className={
          disciplina.ativo ? styles.activeStatus : styles.inactiveStatus
        }
      >
        {disciplina.ativo ? "Ativo" : "Inativo"}
      </span>
    ),
  },
];

export function DisciplinasTable({
  filters = {},
  searchTerm = "",
  actionLabel = "Ver",
  renderAction,
  onActionClick,
  onViewDisciplina,
  onEditDisciplina,
}: DisciplinasTableProps) {
  const disciplinasQuery = useClassGroups(filters);
  const disciplinas = disciplinasQuery.data?.data ?? [];
  const normalizedSearchTerm = normalizeText(searchTerm);
  const rows: DisciplinaTableRow[] = disciplinas
    .filter((disciplina) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      const searchableText = [
        disciplina.disciplina.nome,
        disciplina.sigla,
        disciplina.disciplina.curso.nome,
        disciplina.disciplina.curso.sigla,
        disciplina.periodoLetivo.nome,
        getPeriodoAnoMes(disciplina),
        getProfessorText(disciplina),
        String(disciplina.matriculados),
        String(disciplina.disciplina.cargaHoraria),
      ].join(" ");

      return normalizeText(searchableText).includes(normalizedSearchTerm);
    })
    .map((disciplina) => ({
      ...disciplina,
      onDisciplinaClick: onViewDisciplina,
    }));

  return (
    <Table
      ariaLabel="Tabela de disciplinas"
      columns={columns}
      data={rows}
      emptyMessage={
        searchTerm
          ? "Nenhuma disciplina encontrada para o filtro informado."
          : "Nenhuma disciplina encontrada."
      }
      getRowKey={(disciplina) => disciplina.id}
      isLoading={disciplinasQuery.isLoading}
      loadingMessage="Carregando disciplinas..."
      actions={
        renderAction || onActionClick || onViewDisciplina || onEditDisciplina
          ? (disciplina) =>
              renderAction ? (
                renderAction(disciplina)
              ) : onViewDisciplina || onEditDisciplina ? (
                <div className={styles.actionGroup}>
                  {onViewDisciplina ? (
                    <Tooltip title="Visualizar disciplina">
                      <IconButton
                        aria-label={`Visualizar ${disciplina.disciplina.nome}`}
                        className={styles.iconButton}
                        onClick={() => onViewDisciplina(disciplina)}
                        size="small"
                        type="button"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {onEditDisciplina ? (
                    <Tooltip title="Editar disciplina">
                      <IconButton
                        aria-label={`Editar ${disciplina.disciplina.nome}`}
                        className={styles.iconButton}
                        onClick={() => onEditDisciplina(disciplina)}
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
                  onClick={() => onActionClick?.(disciplina)}
                >
                  {actionLabel}
                </button>
              )
          : undefined
      }
    />
  );
}

export default DisciplinasTable;
