"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useClassGroupStudents } from "@/modules/aluno/hooks/use-get-class-group-students";
import type { ClassGroupStudent } from "@/modules/aluno/interfaces/class-group-student";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { useClassGroups } from "@/modules/disciplina/hooks/use-get-class-groups";
import type { DisciplinaOferta } from "@/modules/disciplina/interfaces/disciplina-oferta";
import { PaginationControls } from "@/shared/components/pagination-controls/pagination-controls";
import { Table, type TableColumn } from "@/shared/components/table/table";
import { useProfessores } from "../../hooks/use-get-professores";
import type { Professor } from "../../interfaces/professor";
import styles from "./meus-alunos-page.module.css";

const pageSize = 10;
const allCoursesValue = "TODOS";
const allClassGroupsValue = "TODAS";

type CourseOption = {
  id: string;
  label: string;
};

function getStudentName(link: ClassGroupStudent) {
  return (
    link.estudante.pessoaInstitucional.nomeSocial?.trim() ||
    link.estudante.pessoaInstitucional.nome
  );
}

function getCourseLabel(classGroup: DisciplinaOferta) {
  const course = classGroup.disciplina.curso;

  return `${course.sigla} - ${course.nome}`;
}

function getClassGroupLabel(classGroup: DisciplinaOferta) {
  return `${classGroup.disciplina.nome} (${classGroup.sigla})`;
}

function getProfessorFromQuery(
  professors: Professor[],
  emailInstitucional?: string,
  matricula?: string,
) {
  return (
    professors.find(
      (professor) =>
        professor.pessoaInstitucional.emailInstitucional.toLowerCase() ===
        emailInstitucional?.toLowerCase(),
    ) ??
    professors.find((professor) => professor.pessoaInstitucional.matricula === matricula) ??
    professors[0] ??
    null
  );
}

function buildCourseOptions(classGroups: DisciplinaOferta[]): CourseOption[] {
  const coursesById = new Map<string, CourseOption>();

  for (const classGroup of classGroups) {
    const course = classGroup.disciplina.curso;

    coursesById.set(course.id, {
      id: course.id,
      label: getCourseLabel(classGroup),
    });
  }

  return Array.from(coursesById.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function MeusAlunosPage() {
  const session = useAuthSession();
  const [page, setPage] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState(allCoursesValue);
  const [selectedClassGroupId, setSelectedClassGroupId] = useState(allClassGroupsValue);
  const professorEmail = session?.payload.emailInstitucional ?? "";
  const professorMatricula = session?.payload.matricula ?? "";

  const professorByEmailQuery = useProfessores(
    {
      page: 1,
      pageSize: 5,
      emailInstitucional: professorEmail,
      ativo: true,
    },
    Boolean(professorEmail),
  );
  const professorByEmail = getProfessorFromQuery(
    professorByEmailQuery.data?.data ?? [],
    professorEmail,
    professorMatricula,
  );
  const professorByMatriculaQuery = useProfessores(
    {
      page: 1,
      pageSize: 5,
      matricula: professorMatricula,
      ativo: true,
    },
    Boolean(professorMatricula && professorByEmailQuery.isFetched && !professorByEmail),
  );
  const professor =
    professorByEmail ??
    getProfessorFromQuery(
      professorByMatriculaQuery.data?.data ?? [],
      professorEmail,
      professorMatricula,
    );
  const professorId = professor?.id;

  const classGroupsQuery = useClassGroups(
    {
      page: 1,
      pageSize: 100,
      professorId,
      ativo: true,
      sortBy: "disciplina",
      sortDirection: "asc",
    },
    Boolean(professorId),
  );
  const professorClassGroups = useMemo(
    () => classGroupsQuery.data?.data ?? [],
    [classGroupsQuery.data?.data],
  );
  const courseOptions = useMemo(
    () => buildCourseOptions(professorClassGroups),
    [professorClassGroups],
  );
  const filteredClassGroups = useMemo(
    () =>
      professorClassGroups.filter((classGroup) =>
        selectedCourseId === allCoursesValue
          ? true
          : classGroup.disciplina.curso.id === selectedCourseId,
      ),
    [professorClassGroups, selectedCourseId],
  );

  const studentsQuery = useClassGroupStudents(
    {
      page,
      pageSize,
      professorId,
      ...(selectedCourseId !== allCoursesValue ? { cursoId: selectedCourseId } : {}),
      ...(selectedClassGroupId !== allClassGroupsValue
        ? { turmaId: selectedClassGroupId }
        : {}),
    },
    Boolean(professorId),
  );
  const students = studentsQuery.data?.data ?? [];
  const totalPages = Math.max(studentsQuery.data?.meta.totalPages ?? 1, 1);
  const totalItems = studentsQuery.data?.meta.totalItems ?? 0;
  const isLoadingProfessor =
    professorByEmailQuery.isLoading || professorByMatriculaQuery.isLoading;
  const isLoading = isLoadingProfessor || classGroupsQuery.isLoading || studentsQuery.isLoading;
  const emptyMessage = professorId
    ? "Nenhum aluno encontrado para os filtros informados."
    : "Nenhum cadastro de professor foi encontrado para o usuário logado.";

  const handleCourseChange = (event: SelectChangeEvent) => {
    setPage(1);
    setSelectedCourseId(event.target.value);
    setSelectedClassGroupId(allClassGroupsValue);
  };

  const handleClassGroupChange = (event: SelectChangeEvent) => {
    setPage(1);
    setSelectedClassGroupId(event.target.value);
  };

  const columns = useMemo<TableColumn<ClassGroupStudent>[]>(
    () => [
      {
        key: "matricula",
        header: "Matrícula",
        width: "14%",
        render: (row) => row.estudante.pessoaInstitucional.matricula,
      },
      {
        key: "nome",
        header: "Nome",
        width: "22%",
        render: (row) => <span className={styles.studentName}>{getStudentName(row)}</span>,
      },
      {
        key: "email",
        header: "E-mail",
        width: "22%",
        render: (row) => row.estudante.pessoaInstitucional.emailInstitucional,
      },
      {
        key: "curso",
        header: "Curso",
        width: "18%",
        render: (row) => getCourseLabel(row.turma),
      },
      {
        key: "turma",
        header: "Turma",
        width: "14%",
        render: (row) => getClassGroupLabel(row.turma),
      },
      {
        key: "periodo",
        header: "Período",
        width: "10%",
        render: (row) => row.turma.periodoLetivo.nome,
      },
    ],
    [],
  );

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <FormControl className={styles.courseField} size="small">
            <InputLabel id="professor-course-filter-label">Curso</InputLabel>
            <Select
              labelId="professor-course-filter-label"
              label="Curso"
              value={selectedCourseId}
              onChange={handleCourseChange}
            >
              <MenuItem value={allCoursesValue}>Todos os cursos</MenuItem>
              {courseOptions.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={styles.classField} size="small">
            <InputLabel id="professor-class-filter-label">Turma</InputLabel>
            <Select
              labelId="professor-class-filter-label"
              label="Turma"
              value={selectedClassGroupId}
              onChange={handleClassGroupChange}
            >
              <MenuItem value={allClassGroupsValue}>Todas as turmas</MenuItem>
              {filteredClassGroups.map((classGroup) => (
                <MenuItem key={classGroup.id} value={classGroup.id}>
                  {getClassGroupLabel(classGroup)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className={styles.summary} aria-label="Total de alunos encontrados">
          <strong>{totalItems}</strong>
          <span>aluno(s)</span>
        </div>
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <Table
        ariaLabel="Tabela de meus alunos"
        columns={columns}
        data={students}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingMessage="Carregando alunos..."
        emptyMessage={emptyMessage}
      />

      {!professorId && !isLoadingProfessor ? (
        <span className={styles.muted}>
          Verifique se o usuário professor possui o mesmo e-mail institucional ou matrícula do
          cadastro de professor.
        </span>
      ) : null}
    </div>
  );
}

export default MeusAlunosPage;
