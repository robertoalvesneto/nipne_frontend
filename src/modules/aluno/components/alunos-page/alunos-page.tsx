"use client";

import { useMemo, useState } from "react";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import { useCreateCourseEnrollment } from "../../hooks/use-create-course-enrollment";
import { useCreateStudent } from "../../hooks/use-create-student";
import { useCourses } from "../../hooks/use-get-courses";
import type { Course } from "../../interfaces/course";
import type { StudentListItem } from "../../interfaces/student";
import type { StudentsListQueryApiDto } from "../../services/get-students-service";
import { AlunoDetailsDrawer } from "../aluno-details-drawer/aluno-details-drawer";
import { AlunoFormDrawer } from "../aluno-form-drawer/aluno-form-drawer";
import type { AlunoFormSubmitValues } from "../aluno-form/aluno-form";
import { AlunoImportDialog } from "../aluno-import-dialog/aluno-import-dialog";
import {
  AlunosTable,
  type StudentsPaginationMeta,
} from "../alunos-table/alunos-table";
import styles from "./alunos-page.module.css";

type StatusFilter = "todos" | "ativos" | "inativos";

const pageSize = 10;

function getCourseById(courses: Course[], courseId: string) {
  return courses.find((course) => course.id === courseId);
}

export function AlunosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [courseFilter, setCourseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] =
    useState<StudentsPaginationMeta>();
  const [selectedAluno, setSelectedAluno] = useState<StudentListItem | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const coursesQuery = useCourses();
  const createStudentMutation = useCreateStudent();
  const createCourseEnrollmentMutation = useCreateCourseEnrollment();

  const courses = coursesQuery.data?.data ?? [];
  const filters = useMemo<StudentsListQueryApiDto>(
    () => ({
      page,
      pageSize,
      ...(courseFilter ? { cursoId: courseFilter } : {}),
      ...(statusFilter === "ativos" ? { ativo: true } : {}),
      ...(statusFilter === "inativos" ? { ativo: false } : {}),
    }),
    [courseFilter, page, statusFilter],
  );
  const isSubmitting =
    createStudentMutation.isPending || createCourseEnrollmentMutation.isPending;
  const totalPages = Math.max(paginationMeta?.totalPages ?? 1, 1);

  const handleStatusChange = (event: SelectChangeEvent) => {
    setPage(1);
    setStatusFilter(event.target.value as StatusFilter);
  };

  const handleCourseChange = (event: SelectChangeEvent) => {
    setPage(1);
    setCourseFilter(event.target.value);
  };

  const openCreateForm = () => {
    setFormError(undefined);
    setIsFormOpen(true);
  };

  const closeCreateForm = () => {
    if (isSubmitting) {
      return;
    }

    setFormError(undefined);
    setIsFormOpen(false);
  };

  const openDetails = (aluno: StudentListItem) => {
    setSelectedAluno(aluno);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleSubmitAluno = async (values: AlunoFormSubmitValues) => {
    setFormError(undefined);

    const course = getCourseById(courses, values.cursoId);

    if (!course) {
      setFormError("Selecione um curso válido.");
      return;
    }

    try {
      const contatosTelefonicos = values.telefone
        ? [
            {
              telefone: values.telefone,
              formaPreferencialContato: true,
              descricao: "WhatsApp",
            },
          ]
        : undefined;
      const hasSupportContact =
        values.contatoApoioNome &&
        values.contatoApoioTelefone &&
        values.contatoApoioRelacao;
      const contatosApoio = hasSupportContact
        ? [
            {
              nome: values.contatoApoioNome!,
              telefone: values.contatoApoioTelefone!,
              relacao: values.contatoApoioRelacao!,
            },
          ]
        : undefined;

      const student = await createStudentMutation.mutateAsync({
        nome: values.nome,
        ...(values.nomeSocial ? { nomeSocial: values.nomeSocial } : {}),
        emailInstitucional: values.emailInstitucional,
        matricula: values.matricula,
        ...(values.dataNascimento
          ? { dataNascimento: values.dataNascimento }
          : {}),
        unidadeAcademicaId: course.unidadeAcademica.id,
        ...(contatosTelefonicos ? { contatosTelefonicos } : {}),
        ...(contatosApoio ? { contatosApoio } : {}),
      });

      await createCourseEnrollmentMutation.mutateAsync({
        estudanteId: student.id,
        cursoId: values.cursoId,
        matricula: values.matricula,
        matriculadoEm: new Date().toISOString(),
        status: "ATIVA",
      });

      toast.success("Aluno adicionado com sucesso.");
      setIsFormOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o aluno.",
      );
    }
  };

  const openImportDialog = () => {
    setImportFile(null);
    setIsImportOpen(true);
  };

  const closeImportDialog = () => {
    setImportFile(null);
    setIsImportOpen(false);
  };

  const handleImport = () => {
    toast.info("Importação de alunos ainda não implementada.");
    closeImportDialog();
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <TextField
            className={styles.searchField}
            label="Buscar aluno"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome, e-mail ou matrícula"
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
            <InputLabel id="aluno-course-filter-label">Curso</InputLabel>
            <Select
              labelId="aluno-course-filter-label"
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

          <FormControl className={styles.statusField} size="small">
            <InputLabel id="aluno-status-filter-label">Status</InputLabel>
            <Select
              labelId="aluno-status-filter-label"
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

      <div className={styles.paginationBar}>
        <Tooltip title="Primeira página">
          <span>
            <IconButton
              className={styles.pageButton}
              disabled={page <= 1}
              onClick={() => setPage(1)}
              size="small"
            >
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Página anterior">
          <span>
            <IconButton
              className={styles.pageButton}
              disabled={page <= 1}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              size="small"
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <span className={styles.pageInfo}>
          {page} de {totalPages}
        </span>
        <Tooltip title="Próxima página">
          <span>
            <IconButton
              className={styles.pageButton}
              disabled={page >= totalPages}
              onClick={() =>
                setPage((currentPage) => Math.min(totalPages, currentPage + 1))
              }
              size="small"
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Última página">
          <span>
            <IconButton
              className={styles.pageButton}
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              size="small"
            >
              <KeyboardDoubleArrowRightIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </div>

      <AlunosTable
        filters={filters}
        searchTerm={searchTerm}
        onMetaChange={setPaginationMeta}
        onViewAluno={openDetails}
        onEditAluno={openDetails}
      />

      <AlunoDetailsDrawer
        open={isDetailsOpen}
        aluno={selectedAluno}
        onClose={closeDetails}
      />

      <AlunoFormDrawer
        open={isFormOpen}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onClose={closeCreateForm}
        onSubmit={handleSubmitAluno}
      />

      <AlunoImportDialog
        open={isImportOpen}
        fileName={importFile?.name}
        onClose={closeImportDialog}
        onFileChange={setImportFile}
        onImport={handleImport}
      />
    </div>
  );
}

export default AlunosPage;
