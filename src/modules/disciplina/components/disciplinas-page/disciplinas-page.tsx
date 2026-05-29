"use client";

import { useMemo, useState } from "react";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { useProfessores } from "@/modules/professor/hooks/use-get-professores";
import type { Professor } from "@/modules/professor/interfaces/professor";
import { PaginationControls } from "@/shared/components/pagination-controls/pagination-controls";
import type { PaginatedResponseMeta } from "@/shared/types/paginated-response-type";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useCreateClassGroupProfessor } from "../../hooks/use-create-class-group-professor";
import { useCreateClassGroup } from "../../hooks/use-create-class-group";
import { useCreateDisciplina } from "../../hooks/use-create-disciplina";
import { useDeleteClassGroupProfessor } from "../../hooks/use-delete-class-group-professor";
import { useAcademicPeriods } from "../../hooks/use-get-academic-periods";
import { useCourses } from "../../hooks/use-get-courses";
import { useUpdateClassGroupStatus } from "../../hooks/use-update-class-group-status";
import { useUpdateClassGroup } from "../../hooks/use-update-class-group";
import { useUpdateDisciplina } from "../../hooks/use-update-disciplina";
import type { AcademicPeriod } from "../../interfaces/academic-period";
import type { Course } from "../../interfaces/course";
import type { DisciplinaOferta } from "../../interfaces/disciplina-oferta";
import { getDisciplinasApi } from "../../services/get-disciplinas-service";
import type { ClassGroupsListQueryApiDto } from "../../services/get-class-groups-service";
import { DisciplinaDetailsDrawer } from "../disciplina-details-drawer/disciplina-details-drawer";
import { DisciplinaFormDrawer } from "../disciplina-form-drawer/disciplina-form-drawer";
import type { DisciplinaFormSubmitValues } from "../disciplina-form/disciplina-form";
import { DisciplinaImportDialog } from "../disciplina-import-dialog/disciplina-import-dialog";
import { DisciplinasTable } from "../disciplinas-table/disciplinas-table";
import styles from "./disciplinas-page.module.css";

type StatusFilter = "todos" | "ativos" | "inativos";
type FormMode = "create" | "edit";

const pageSize = 10;

interface CsvRow {
  nome: string;
  codigo: string;
  cargaHoraria: number;
  cursoId: string;
  periodoLetivoId: string;
  professorId: string;
}

function detectDelimiter(firstLine: string) {
  const semicolonCount = firstLine.split(";").length;
  const commaCount = firstLine.split(",").length;

  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsv(text: string) {
  const delimiter = detectDelimiter(text.split(/\r?\n/, 1)[0] ?? "");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let isQuoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (character === delimiter && !isQuoted) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !isQuoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentValue.trim());
      if (currentRow.some(Boolean)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  currentRow.push(currentValue.trim());
  if (currentRow.some(Boolean)) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(header: string) {
  return normalizeText(header).replace(/[^a-z0-9]/g, "");
}

function getHeaderIndex(headers: string[], aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeHeader);
  return headers.findIndex((header) => normalizedAliases.includes(header));
}

function getProfessorNome(professor: Professor) {
  return (
    professor.pessoaInstitucional.nomeSocial?.trim() ||
    professor.pessoaInstitucional.nome
  );
}

function getPeriodLabel(period: AcademicPeriod) {
  const date = new Date(period.dataInicio);

  if (Number.isNaN(date.getTime())) {
    return period.nome;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function buildCourseLookup(courses: Course[]) {
  const courseByKey = new Map<string, Course>();

  for (const course of courses) {
    for (const key of [course.id, course.sigla, course.nome]) {
      courseByKey.set(normalizeHeader(key), course);
    }
  }

  return courseByKey;
}

function buildPeriodLookup(periods: AcademicPeriod[]) {
  const periodByKey = new Map<string, AcademicPeriod>();

  for (const period of periods) {
    for (const key of [period.id, period.nome, getPeriodLabel(period)]) {
      periodByKey.set(normalizeHeader(key), period);
    }
  }

  return periodByKey;
}

function buildProfessorLookup(professors: Professor[]) {
  const professorByKey = new Map<string, Professor>();

  for (const professor of professors) {
    const person = professor.pessoaInstitucional;

    for (const key of [
      professor.id,
      person.matricula,
      person.emailInstitucional,
      person.nome,
      person.nomeSocial,
      getProfessorNome(professor),
    ]) {
      if (key) {
        professorByKey.set(normalizeHeader(key), professor);
      }
    }
  }

  return professorByKey;
}

function parseDisciplinasCsv(
  text: string,
  courses: Course[],
  periods: AcademicPeriod[],
  professors: Professor[],
): CsvRow[] {
  const rows = parseCsv(text);
  const [rawHeaders, ...dataRows] = rows;

  if (!rawHeaders?.length || !dataRows.length) {
    throw new Error("O arquivo não possui dados para importação.");
  }

  const headers = rawHeaders.map(normalizeHeader);
  const nameIndex = getHeaderIndex(headers, ["nome", "disciplina"]);
  const codeIndex = getHeaderIndex(headers, ["codigo", "código", "sigla"]);
  const workloadIndex = getHeaderIndex(headers, [
    "cargaHoraria",
    "carga_horaria",
    "carga horaria",
    "ch",
  ]);
  const courseIdIndex = getHeaderIndex(headers, ["cursoId", "curso_id"]);
  const courseLookupIndex = getHeaderIndex(headers, [
    "cursoSigla",
    "curso_sigla",
    "curso",
  ]);
  const periodIdIndex = getHeaderIndex(headers, [
    "periodoLetivoId",
    "periodo_letivo_id",
  ]);
  const periodLookupIndex = getHeaderIndex(headers, [
    "periodoLetivo",
    "periodo",
    "anoMes",
    "ano_mes",
  ]);
  const professorIdIndex = getHeaderIndex(headers, [
    "professorId",
    "professor_id",
  ]);
  const professorLookupIndex = getHeaderIndex(headers, [
    "professor",
    "professorMatricula",
    "professor_matricula",
    "professorEmail",
    "professor_email",
  ]);

  if (nameIndex < 0 || codeIndex < 0 || workloadIndex < 0) {
    throw new Error("Inclua as colunas nome, codigo e cargaHoraria.");
  }

  if (courseIdIndex < 0 && courseLookupIndex < 0) {
    throw new Error("Inclua a coluna cursoSigla ou cursoId.");
  }

  if (periodIdIndex < 0 && periodLookupIndex < 0) {
    throw new Error("Inclua a coluna periodo ou periodoLetivoId.");
  }

  if (professorIdIndex < 0 && professorLookupIndex < 0) {
    throw new Error("Inclua a coluna professor ou professorId.");
  }

  const courseLookup = buildCourseLookup(courses);
  const periodLookup = buildPeriodLookup(periods);
  const professorLookup = buildProfessorLookup(professors);

  return dataRows.map((row, rowIndex) => {
    const nome = row[nameIndex]?.trim();
    const codigo = row[codeIndex]?.trim().toUpperCase();
    const cargaHoraria = Number(row[workloadIndex]?.replace(",", "."));
    const courseKey =
      courseIdIndex >= 0 ? row[courseIdIndex] : row[courseLookupIndex];
    const periodKey =
      periodIdIndex >= 0 ? row[periodIdIndex] : row[periodLookupIndex];
    const professorKey =
      professorIdIndex >= 0 ? row[professorIdIndex] : row[professorLookupIndex];
    const course = courseLookup.get(normalizeHeader(courseKey ?? ""));
    const period = periodLookup.get(normalizeHeader(periodKey ?? ""));
    const professor = professorLookup.get(normalizeHeader(professorKey ?? ""));

    if (!nome) {
      throw new Error(`Informe o nome da disciplina na linha ${rowIndex + 2}.`);
    }

    if (!codigo) {
      throw new Error(`Informe o código da disciplina na linha ${rowIndex + 2}.`);
    }

    if (!Number.isInteger(cargaHoraria) || cargaHoraria <= 0) {
      throw new Error(
        `Informe uma carga horária válida na linha ${rowIndex + 2}.`,
      );
    }

    if (!course) {
      throw new Error(`Curso não encontrado na linha ${rowIndex + 2}.`);
    }

    if (!period) {
      throw new Error(`Período letivo não encontrado na linha ${rowIndex + 2}.`);
    }

    if (!professor) {
      throw new Error(`Professor não encontrado na linha ${rowIndex + 2}.`);
    }

    return {
      nome,
      codigo,
      cargaHoraria,
      cursoId: course.id,
      periodoLetivoId: period.id,
      professorId: professor.id,
    };
  });
}

export function DisciplinasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [courseFilter, setCourseFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginatedResponseMeta>();
  const [selectedDisciplina, setSelectedDisciplina] =
    useState<DisciplinaOferta | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | undefined>();
  const coursesQuery = useCourses();
  const periodsQuery = useAcademicPeriods({ ativo: true });
  const professorsQuery = useProfessores({
    page: 1,
    pageSize: 100,
    ativo: true,
    sortBy: "nome",
    sortDirection: "asc",
  });
  const createDisciplinaMutation = useCreateDisciplina();
  const updateDisciplinaMutation = useUpdateDisciplina();
  const createClassGroupMutation = useCreateClassGroup();
  const updateClassGroupMutation = useUpdateClassGroup();
  const updateClassGroupStatusMutation = useUpdateClassGroupStatus();
  const createClassGroupProfessorMutation = useCreateClassGroupProfessor();
  const deleteClassGroupProfessorMutation = useDeleteClassGroupProfessor();

  const filters = useMemo<ClassGroupsListQueryApiDto>(
    () => ({
      page,
      pageSize,
      ...(courseFilter ? { cursoId: courseFilter } : {}),
      ...(periodFilter ? { periodoLetivoId: periodFilter } : {}),
      ...(statusFilter === "ativos" ? { ativo: true } : {}),
      ...(statusFilter === "inativos" ? { ativo: false } : {}),
    }),
    [courseFilter, page, periodFilter, statusFilter],
  );

  const courses = coursesQuery.data?.data ?? [];
  const periods = periodsQuery.data?.data ?? [];
  const professors = professorsQuery.data?.data ?? [];
  const totalPages = Math.max(paginationMeta?.totalPages ?? 1, 1);
  const isSubmitting =
    createDisciplinaMutation.isPending ||
    updateDisciplinaMutation.isPending ||
    createClassGroupMutation.isPending ||
    updateClassGroupMutation.isPending ||
    updateClassGroupStatusMutation.isPending ||
    createClassGroupProfessorMutation.isPending ||
    deleteClassGroupProfessorMutation.isPending;

  const handleStatusChange = (event: SelectChangeEvent) => {
    setPage(1);
    setStatusFilter(event.target.value as StatusFilter);
  };

  const handleCourseChange = (event: SelectChangeEvent) => {
    setPage(1);
    setCourseFilter(event.target.value);
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPage(1);
    setPeriodFilter(event.target.value);
  };

  const openCreateForm = () => {
    setSelectedDisciplina(null);
    setFormError(undefined);
    setFormMode("create");
  };

  const openDetails = (disciplina: DisciplinaOferta) => {
    setSelectedDisciplina(disciplina);
    setIsDetailsOpen(true);
  };

  const openEditForm = (disciplina: DisciplinaOferta) => {
    setSelectedDisciplina(disciplina);
    setIsDetailsOpen(false);
    setFormError(undefined);
    setFormMode("edit");
  };

  const closeForm = () => {
    if (isSubmitting) {
      return;
    }

    setFormMode(null);
    setFormError(undefined);
  };

  const openImportDialog = () => {
    setImportFile(null);
    setImportError(undefined);
    setIsImportOpen(true);
  };

  const closeImportDialog = () => {
    if (isSubmitting) {
      return;
    }

    setIsImportOpen(false);
    setImportError(undefined);
    setImportFile(null);
  };

  const getOrCreateDisciplina = async (values: DisciplinaFormSubmitValues) => {
    try {
      return await createDisciplinaMutation.mutateAsync({
        cursoId: values.cursoId,
        nome: values.nome,
        cargaHoraria: values.cargaHoraria,
      });
    } catch (error) {
      const response = await getDisciplinasApi({
        page: 1,
        pageSize: 100,
        cursoId: values.cursoId,
        nome: values.nome,
      });
      const existingDisciplina = response.data.find(
        (disciplina) =>
          normalizeText(disciplina.nome) === normalizeText(values.nome) &&
          disciplina.curso.id === values.cursoId,
      );

      if (!existingDisciplina) {
        throw error;
      }

      return existingDisciplina;
    }
  };

  const syncProfessorLink = async (
    disciplina: DisciplinaOferta,
    professorId: string,
  ) => {
    const currentLinks = disciplina.professores;
    const selectedProfessorAlreadyLinked = currentLinks.some(
      (professor) => professor.id === professorId,
    );

    for (const professor of currentLinks) {
      if (professor.id !== professorId) {
        await deleteClassGroupProfessorMutation.mutateAsync(
          professor.vinculoId,
        );
      }
    }

    if (!selectedProfessorAlreadyLinked) {
      await createClassGroupProfessorMutation.mutateAsync({
        professorId,
        turmaId: disciplina.id,
      });
    }
  };

  const handleSubmitDisciplina = async (
    values: DisciplinaFormSubmitValues,
  ) => {
    setFormError(undefined);

    try {
      if (formMode === "create") {
        const disciplina = await getOrCreateDisciplina(values);
        const classGroup = await createClassGroupMutation.mutateAsync({
          disciplinaId: disciplina.id,
          periodoLetivoId: values.periodoLetivoId,
          nome: values.nome,
          sigla: values.codigo,
        });

        await createClassGroupProfessorMutation.mutateAsync({
          professorId: values.professorId,
          turmaId: classGroup.id,
        });

        toast.success("Disciplina adicionada com sucesso.");
      }

      if (formMode === "edit" && selectedDisciplina) {
        await updateDisciplinaMutation.mutateAsync({
          id: selectedDisciplina.disciplina.id,
          data: {
            cursoId: values.cursoId,
            nome: values.nome,
            cargaHoraria: values.cargaHoraria,
          },
        });

        await updateClassGroupMutation.mutateAsync({
          id: selectedDisciplina.id,
          data: {
            disciplinaId: selectedDisciplina.disciplina.id,
            periodoLetivoId: values.periodoLetivoId,
            nome: values.nome,
            sigla: values.codigo,
          },
        });

        await syncProfessorLink(selectedDisciplina, values.professorId);

        if (
          values.ativo !== undefined &&
          values.ativo !== selectedDisciplina.ativo
        ) {
          await updateClassGroupStatusMutation.mutateAsync({
            id: selectedDisciplina.id,
            ativo: values.ativo,
          });
        }

        toast.success("Disciplina atualizada com sucesso.");
      }

      setFormMode(null);
      setSelectedDisciplina(null);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a disciplina.",
      );
    }
  };

  const handleImportFileChange = (file: File | null) => {
    setImportFile(file);
    setImportError(undefined);
  };

  const handleImportDisciplinas = async () => {
    setImportError(undefined);

    if (!importFile) {
      setImportError("Selecione um arquivo para importar.");
      return;
    }

    if (!importFile.name.toLowerCase().endsWith(".csv")) {
      setImportError("Selecione um arquivo no formato .csv.");
      return;
    }

    try {
      const text = await importFile.text();
      const disciplinas = parseDisciplinasCsv(
        text,
        courses,
        periods,
        professors,
      );

      for (const disciplina of disciplinas) {
        const savedDisciplina = await getOrCreateDisciplina({
          ...disciplina,
          ativo: true,
        });
        const classGroup = await createClassGroupMutation.mutateAsync({
          disciplinaId: savedDisciplina.id,
          periodoLetivoId: disciplina.periodoLetivoId,
          nome: disciplina.nome,
          sigla: disciplina.codigo,
        });

        await createClassGroupProfessorMutation.mutateAsync({
          professorId: disciplina.professorId,
          turmaId: classGroup.id,
        });
      }

      toast.success(
        disciplinas.length === 1
          ? "Disciplina importada com sucesso."
          : "Disciplinas importadas com sucesso.",
      );
      closeImportDialog();
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Não foi possível importar as disciplinas.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <TextField
            className={styles.searchField}
            label="Buscar disciplina"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome, professor, período ou curso"
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

          <FormControl className={styles.courseField} size="small">
            <InputLabel id="disciplina-course-filter-label">Curso</InputLabel>
            <Select
              labelId="disciplina-course-filter-label"
              label="Curso"
              value={courseFilter}
              onChange={handleCourseChange}
            >
              <MenuItem value="">Todos os cursos</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.sigla} - {course.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={styles.periodField} size="small">
            <InputLabel id="disciplina-period-filter-label">Período</InputLabel>
            <Select
              labelId="disciplina-period-filter-label"
              label="Período"
              value={periodFilter}
              onChange={handlePeriodChange}
            >
              <MenuItem value="">Todos os períodos</MenuItem>
              {periods.map((period) => (
                <MenuItem key={period.id} value={period.id}>
                  {getPeriodLabel(period)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={styles.statusField} size="small">
            <InputLabel id="disciplina-status-filter-label">Status</InputLabel>
            <Select
              labelId="disciplina-status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativos">Ativos</MenuItem>
              <MenuItem value="inativos">Inativos</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className={styles.actions}>
          <Button
            className={styles.importButton}
            variant="outlined"
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={openImportDialog}
          >
            Importar
          </Button>
          <Button
            className={styles.addButton}
            variant="contained"
            startIcon={<AddCircleOutlinedIcon />}
            onClick={openCreateForm}
          >
            Adicionar Novo
          </Button>
        </div>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <DisciplinasTable
        filters={filters}
        searchTerm={searchTerm}
        onMetaChange={setPaginationMeta}
        onViewDisciplina={openDetails}
        onEditDisciplina={openEditForm}
      />

      <DisciplinaDetailsDrawer
        open={isDetailsOpen}
        disciplina={selectedDisciplina}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={openEditForm}
      />

      <DisciplinaFormDrawer
        open={Boolean(formMode)}
        mode={formMode ?? "create"}
        disciplina={selectedDisciplina}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onClose={closeForm}
        onSubmit={handleSubmitDisciplina}
      />

      <DisciplinaImportDialog
        open={isImportOpen}
        isImporting={isSubmitting && isImportOpen}
        errorMessage={importError}
        fileName={importFile?.name}
        onClose={closeImportDialog}
        onFileChange={handleImportFileChange}
        onImport={handleImportDisciplinas}
      />
    </div>
  );
}

export default DisciplinasPage;
