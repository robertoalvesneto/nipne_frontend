"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Drawer,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { PaginationControls } from "@/shared/components/pagination-controls/pagination-controls";
import { Table, type TableColumn } from "@/shared/components/table/table";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useClassGroupStudents } from "../../hooks/use-get-class-group-students";
import { useStudents } from "../../hooks/use-get-students";
import type { ClassGroupStudent } from "../../interfaces/class-group-student";
import styles from "./minhas-disciplinas-page.module.css";

const pageSize = 10;

type DisciplineRow = ClassGroupStudent;

function getStudentName(link: ClassGroupStudent) {
  return (
    link.estudante.pessoaInstitucional.nomeSocial?.trim() ||
    link.estudante.pessoaInstitucional.nome
  );
}

function getProfessorText(link: ClassGroupStudent) {
  return (
    link.turma.professores
      .map(
        (professor) =>
          professor.pessoaInstitucional.nomeSocial?.trim() ||
          professor.pessoaInstitucional.nome,
      )
      .join(", ") || "-"
  );
}

function getPeriodoAnoMes(link: ClassGroupStudent) {
  const date = new Date(link.turma.periodoLetivo.dataInicio);

  if (Number.isNaN(date.getTime())) {
    return link.turma.periodoLetivo.nome;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getSearchableText(link: ClassGroupStudent) {
  return [
    link.turma.disciplina.nome,
    link.turma.sigla,
    link.turma.disciplina.curso.nome,
    link.turma.disciplina.curso.sigla,
    link.turma.periodoLetivo.nome,
    getPeriodoAnoMes(link),
    getProfessorText(link),
    String(link.turma.disciplina.cargaHoraria),
  ].join(" ");
}

interface DisciplinaDetailsDrawerProps {
  disciplina?: ClassGroupStudent | null;
  open: boolean;
  onClose: () => void;
}

function DisciplinaDetailsDrawer({
  disciplina,
  open,
  onClose,
}: DisciplinaDetailsDrawerProps) {
  const turma = disciplina?.turma;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { className: styles.drawer } }}
    >
      {disciplina && turma ? (
        <div className={styles.drawerPanel}>
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitle}>
              <MenuBookRoundedIcon />
              <h2>
                {turma.disciplina.nome} <span>(ID: {turma.id.slice(0, 8)})</span>
              </h2>
            </div>
            <IconButton aria-label="Fechar detalhes" onClick={onClose}>
              <ArrowForwardIcon />
            </IconButton>
          </div>

          <div className={styles.drawerTabs}>
            <span className={styles.activeTab}>Dados Gerais</span>
          </div>

          <dl className={styles.detailGrid}>
            <div>
              <dt>Disciplina</dt>
              <dd>{turma.disciplina.nome}</dd>
            </div>
            <div>
              <dt>Código</dt>
              <dd>{turma.sigla}</dd>
            </div>
            <div>
              <dt>Curso</dt>
              <dd>
                {turma.disciplina.curso.sigla} - {turma.disciplina.curso.nome}
              </dd>
            </div>
            <div>
              <dt>Professor</dt>
              <dd>{getProfessorText(disciplina)}</dd>
            </div>
            <div>
              <dt>Período letivo</dt>
              <dd>
                {turma.periodoLetivo.nome} ({getPeriodoAnoMes(disciplina)})
              </dd>
            </div>
            <div>
              <dt>Carga horária</dt>
              <dd>{turma.disciplina.cargaHoraria}h</dd>
            </div>
            <div>
              <dt>Matriculados</dt>
              <dd>{turma.matriculados}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{turma.ativo ? "Ativa" : "Inativa"}</dd>
            </div>
            <div>
              <dt>Aluno</dt>
              <dd>{getStudentName(disciplina)}</dd>
            </div>
            <div>
              <dt>Vínculo criado em</dt>
              <dd>{new Date(disciplina.createdAt).toLocaleDateString("pt-BR")}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </Drawer>
  );
}

export function MinhasDisciplinasPage() {
  const session = useAuthSession();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisciplina, setSelectedDisciplina] =
    useState<ClassGroupStudent | null>(null);
  const studentEmail = session?.payload.emailInstitucional ?? "";
  const studentsQuery = useStudents(
    {
      page: 1,
      pageSize: 1,
      emailInstitucional: studentEmail,
    },
    Boolean(studentEmail),
  );
  const student = studentsQuery.data?.data[0] ?? null;
  const disciplinesQuery = useClassGroupStudents(
    {
      page: 1,
      pageSize: 100,
      estudanteId: student?.id,
    },
    Boolean(student?.id),
  );
  const allDisciplines = useMemo(
    () => disciplinesQuery.data?.data ?? [],
    [disciplinesQuery.data?.data],
  );
  const normalizedSearchTerm = normalizeText(searchTerm);
  const filteredDisciplines = useMemo(
    () =>
      allDisciplines.filter((link) =>
        normalizedSearchTerm
          ? normalizeText(getSearchableText(link)).includes(normalizedSearchTerm)
          : true,
      ),
    [allDisciplines, normalizedSearchTerm],
  );
  const totalPages = Math.max(Math.ceil(filteredDisciplines.length / pageSize), 1);
  const paginatedDisciplines = filteredDisciplines.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const isLoading =
    studentsQuery.isLoading || (Boolean(student?.id) && disciplinesQuery.isLoading);

  const columns = useMemo<TableColumn<DisciplineRow>[]>(
    () => [
      {
        key: "id",
        header: "ID",
        width: "9%",
        render: (row) => row.turma.id.slice(0, 8),
      },
      {
        key: "nome",
        header: "Nome",
        width: "22%",
        render: (row) => (
          <button
            className={styles.disciplineButton}
            type="button"
            onClick={() => setSelectedDisciplina(row)}
          >
            {row.turma.disciplina.nome}
          </button>
        ),
      },
      {
        key: "codigo",
        header: "Código",
        width: "10%",
        render: (row) => row.turma.sigla,
      },
      {
        key: "curso",
        header: "Curso",
        width: "16%",
        render: (row) => row.turma.disciplina.curso.sigla,
      },
      {
        key: "professor",
        header: "Professor",
        width: "20%",
        render: (row) => getProfessorText(row),
      },
      {
        key: "periodo",
        header: "Período",
        width: "10%",
        render: (row) => getPeriodoAnoMes(row),
      },
      {
        key: "status",
        header: "Status",
        width: "10%",
        render: (row) => (
          <span className={row.turma.ativo ? styles.activeStatus : styles.inactiveStatus}>
            {row.turma.ativo ? "Ativa" : "Inativa"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <TextField
          className={styles.searchField}
          label="Buscar disciplina"
          onChange={(event) => {
            setPage(1);
            setSearchTerm(event.target.value);
          }}
          placeholder="Nome, código ou professor"
          size="small"
          value={searchTerm}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <div className={styles.summary}>
          <strong>{filteredDisciplines.length}</strong>
          <span>disciplina(s)</span>
        </div>
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <Table
        ariaLabel="Tabela de minhas disciplinas"
        columns={columns}
        data={paginatedDisciplines}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingMessage="Carregando disciplinas..."
        emptyMessage={
          student
            ? "Nenhuma disciplina encontrada."
            : "Finalize seu cadastro para visualizar suas disciplinas."
        }
        actions={(row) => (
          <Tooltip title="Visualizar disciplina">
            <IconButton
              aria-label={`Visualizar ${row.turma.disciplina.nome}`}
              className={styles.iconButton}
              onClick={() => setSelectedDisciplina(row)}
              size="small"
              type="button"
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      />
      <DisciplinaDetailsDrawer
        key={selectedDisciplina?.id ?? "sem-disciplina"}
        open={Boolean(selectedDisciplina)}
        disciplina={selectedDisciplina}
        onClose={() => setSelectedDisciplina(null)}
      />
    </div>
  );
}

export default MinhasDisciplinasPage;
