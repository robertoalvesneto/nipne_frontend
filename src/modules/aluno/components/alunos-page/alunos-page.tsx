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
import { PaginationControls } from "@/shared/components/pagination-controls/pagination-controls";
import type { PaginatedResponseMeta } from "@/shared/types/paginated-response-type";
import { useCreateCourseEnrollment } from "../../hooks/use-create-course-enrollment";
import { useCreateStudent } from "../../hooks/use-create-student";
import { useCourseEnrollments } from "../../hooks/use-get-course-enrollments";
import { useCourses } from "../../hooks/use-get-courses";
import { useStudent } from "../../hooks/use-get-student";
import { useUpdateCourseEnrollment } from "../../hooks/use-update-course-enrollment";
import { useUpdateStudent } from "../../hooks/use-update-student";
import type { Course } from "../../interfaces/course";
import type { StudentListItem } from "../../interfaces/student";
import type { StudentsListQueryApiDto } from "../../services/get-students-service";
import { AlunoDetailsDrawer } from "../aluno-details-drawer/aluno-details-drawer";
import { AlunoFormDrawer } from "../aluno-form-drawer/aluno-form-drawer";
import type {
  AlunoFormInitialValues,
  AlunoFormSubmitValues,
} from "../aluno-form/aluno-form";
import { AlunoImportDialog } from "../aluno-import-dialog/aluno-import-dialog";
import { AlunosTable } from "../alunos-table/alunos-table";
import styles from "./alunos-page.module.css";

type StatusFilter = "todos" | "ativos" | "inativos";
type FormMode = "create" | "edit";

const pageSize = 10;

function getCourseById(courses: Course[], courseId: string) {
  return courses.find((course) => course.id === courseId);
}

function getDateInputValue(date?: string | null) {
  if (!date) {
    return "";
  }

  return date.slice(0, 10);
}

export function AlunosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [courseFilter, setCourseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginatedResponseMeta>();
  const [selectedAluno, setSelectedAluno] = useState<StudentListItem | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const coursesQuery = useCourses();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const createCourseEnrollmentMutation = useCreateCourseEnrollment();
  const updateCourseEnrollmentMutation = useUpdateCourseEnrollment();
  const editStudentQuery = useStudent(
    formMode === "edit" ? selectedAluno?.id : undefined,
  );
  const editCourseEnrollmentsQuery = useCourseEnrollments(
    {
      page: 1,
      pageSize: 1,
      ...(selectedAluno?.id ? { estudanteId: selectedAluno.id } : {}),
      status: "ATIVA",
    },
    formMode === "edit" && Boolean(selectedAluno?.id),
  );

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
    createStudentMutation.isPending ||
    updateStudentMutation.isPending ||
    createCourseEnrollmentMutation.isPending ||
    updateCourseEnrollmentMutation.isPending;
  const isFormLoading =
    formMode === "edit" &&
    (editStudentQuery.isLoading || editCourseEnrollmentsQuery.isLoading);
  const activeCourseEnrollment = editCourseEnrollmentsQuery.data?.data[0];
  const editInitialValues = useMemo<AlunoFormInitialValues | undefined>(() => {
    if (formMode !== "edit" || !selectedAluno || !editStudentQuery.data) {
      return undefined;
    }

    const details = editStudentQuery.data;
    const telefonePreferencial =
      details.contatosTelefonicos.find(
        (contact) => contact.formaPreferencialContato,
      ) ?? details.contatosTelefonicos[0];
    const contatoApoio = details.contatosApoio[0];

    return {
      nome: details.pessoaInstitucional.nome,
      nomeSocial: details.pessoaInstitucional.nomeSocial ?? "",
      emailInstitucional: details.pessoaInstitucional.emailInstitucional,
      matricula:
        activeCourseEnrollment?.matricula ??
        selectedAluno.cursoAtual?.matricula ??
        details.pessoaInstitucional.matricula,
      dataNascimento: getDateInputValue(details.dataNascimento),
      cursoId:
        activeCourseEnrollment?.curso.id ?? selectedAluno.cursoAtual?.id ?? "",
      telefone: telefonePreferencial?.telefone ?? "",
      contatoApoioNome: contatoApoio?.nome ?? "",
      contatoApoioTelefone: contatoApoio?.telefone ?? "",
      contatoApoioRelacao: contatoApoio?.relacao ?? "",
    };
  }, [
    activeCourseEnrollment?.curso.id,
    activeCourseEnrollment?.matricula,
    editStudentQuery.data,
    formMode,
    selectedAluno,
  ]);
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
    setSelectedAluno(null);
    setFormError(undefined);
    setFormMode("create");
  };

  const closeForm = () => {
    if (isSubmitting) {
      return;
    }

    setFormError(undefined);
    setFormMode(null);
  };

  const openDetails = (aluno: StudentListItem) => {
    setSelectedAluno(aluno);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
  };

  const openEditForm = (aluno: StudentListItem) => {
    setSelectedAluno(aluno);
    setIsDetailsOpen(false);
    setFormError(undefined);
    setFormMode("edit");
  };

  const handleSubmitAluno = async (values: AlunoFormSubmitValues) => {
    setFormError(undefined);

    const course = getCourseById(courses, values.cursoId);

    if (!course) {
      setFormError("Selecione um curso válido.");
      return;
    }

    const contatosTelefonicos = values.telefone
      ? [
          {
            telefone: values.telefone,
            formaPreferencialContato: true,
            descricao: "WhatsApp",
          },
        ]
      : [];
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
      : [];

    try {
      if (formMode === "edit") {
        if (!selectedAluno) {
          setFormError("Selecione um aluno para editar.");
          return;
        }

        await updateStudentMutation.mutateAsync({
          id: selectedAluno.id,
          data: {
            nome: values.nome,
            nomeSocial: values.nomeSocial ?? "",
            emailInstitucional: values.emailInstitucional,
            matricula: values.matricula,
            ...(values.dataNascimento
              ? { dataNascimento: values.dataNascimento }
              : {}),
            unidadeAcademicaId: course.unidadeAcademica.id,
            contatosTelefonicos,
            contatosApoio,
          },
        });

        if (activeCourseEnrollment) {
          await updateCourseEnrollmentMutation.mutateAsync({
            id: activeCourseEnrollment.id,
            data: {
              cursoId: values.cursoId,
              matricula: values.matricula,
              status: "ATIVA",
            },
          });
        } else {
          await createCourseEnrollmentMutation.mutateAsync({
            estudanteId: selectedAluno.id,
            cursoId: values.cursoId,
            matricula: values.matricula,
            matriculadoEm: new Date().toISOString(),
            status: "ATIVA",
          });
        }

        toast.success("Aluno atualizado com sucesso.");
        setFormMode(null);
        setSelectedAluno(null);
        return;
      }

      const student = await createStudentMutation.mutateAsync({
        nome: values.nome,
        ...(values.nomeSocial ? { nomeSocial: values.nomeSocial } : {}),
        emailInstitucional: values.emailInstitucional,
        matricula: values.matricula,
        ...(values.dataNascimento
          ? { dataNascimento: values.dataNascimento }
          : {}),
        unidadeAcademicaId: course.unidadeAcademica.id,
        ...(contatosTelefonicos.length ? { contatosTelefonicos } : {}),
        ...(contatosApoio.length ? { contatosApoio } : {}),
      });

      await createCourseEnrollmentMutation.mutateAsync({
        estudanteId: student.id,
        cursoId: values.cursoId,
        matricula: values.matricula,
        matriculadoEm: new Date().toISOString(),
        status: "ATIVA",
      });

      toast.success("Aluno adicionado com sucesso.");
      setFormMode(null);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o aluno.",
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

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <AlunosTable
        filters={filters}
        searchTerm={searchTerm}
        onMetaChange={setPaginationMeta}
        onViewAluno={openDetails}
        onEditAluno={openEditForm}
      />

      <AlunoDetailsDrawer
        key={selectedAluno?.id ?? "empty"}
        open={isDetailsOpen}
        aluno={selectedAluno}
        onClose={closeDetails}
        onEdit={openEditForm}
      />

      <AlunoFormDrawer
        open={Boolean(formMode)}
        mode={formMode ?? "create"}
        initialValues={editInitialValues}
        isLoading={isFormLoading}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onClose={closeForm}
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
