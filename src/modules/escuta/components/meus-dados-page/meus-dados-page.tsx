"use client";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCreateClassGroupStudent } from "@/modules/aluno/hooks/use-create-class-group-student";
import { useDeleteClassGroupStudent } from "@/modules/aluno/hooks/use-delete-class-group-student";
import { useClassGroupStudents } from "@/modules/aluno/hooks/use-get-class-group-students";
import { useCourseEnrollments } from "@/modules/aluno/hooks/use-get-course-enrollments";
import { useCourses } from "@/modules/aluno/hooks/use-get-courses";
import { useStudent } from "@/modules/aluno/hooks/use-get-student";
import { useStudents } from "@/modules/aluno/hooks/use-get-students";
import { useCreateCourseEnrollment } from "@/modules/aluno/hooks/use-create-course-enrollment";
import { useCreateStudent } from "@/modules/aluno/hooks/use-create-student";
import { useUpdateCourseEnrollment } from "@/modules/aluno/hooks/use-update-course-enrollment";
import { useUpdateStudent } from "@/modules/aluno/hooks/use-update-student";
import type { Course } from "@/modules/aluno/interfaces/course";
import type { Student, StudentListItem } from "@/modules/aluno/interfaces/student";
import type { CreateStudentBodyApiDto } from "@/modules/aluno/services/create-student-service";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { useCreateEscuta } from "../../hooks/use-create-escuta";
import { useEscutas } from "../../hooks/use-get-escutas";
import type { Escuta } from "../../interfaces/escuta";
import type { RespostasQuestionarioCadastro } from "../../interfaces/questionario-cadastro";
import { CadastroEscutaDrawer } from "./cadastro-escuta-drawer";
import type { CadastroValues } from "./cadastro-escuta-types";
import styles from "./meus-dados-page.module.css";

function getDisplayName(student?: StudentListItem | null, fallback = "") {
  return (
    student?.pessoaInstitucional.nomeSocial?.trim() ||
    student?.pessoaInstitucional.nome ||
    fallback
  );
}

function getDateInputValue(date?: string | null) {
  return date ? date.slice(0, 10) : "";
}

function formatTipoOfertaEspecial(tipoOfertaEspecial: string) {
  const text = tipoOfertaEspecial.replaceAll("_", " ");

  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : "-";
}

function getDateTimeParts(date?: string | null) {
  if (!date) {
    return { date: "-", time: "-" };
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "-", time: "-" };
  }

  return {
    date: formatDatePtBr(date) || "-",
    time: parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getLatestEscuta(escutas: Escuta[]) {
  return escutas[0] ?? null;
}

function getStatusText(escuta?: Escuta | null) {
  if (!escuta) {
    return "Pendente";
  }

  const labels = {
    SOLICITADA: "Solicitada",
    AGENDADA: "Agendada",
    REALIZADA: "Realizada",
    CANCELADA: "Cancelada",
  } satisfies Record<Escuta["status"], string>;

  return labels[escuta.status];
}

function buildInitialValues({
  sessionName,
  sessionEmail,
  sessionMatricula,
  student,
  details,
  escuta,
}: {
  sessionName: string;
  sessionEmail: string;
  sessionMatricula: string;
  student?: StudentListItem | null;
  details?: Student;
  escuta?: Escuta | null;
}): CadastroValues {
  const phone =
    details?.contatosTelefonicos.find((contact) => contact.formaPreferencialContato)
      ?.telefone ?? details?.contatosTelefonicos[0]?.telefone;

  return {
    nome: details?.pessoaInstitucional.nome ?? student?.pessoaInstitucional.nome ?? sessionName,
    dataNascimento: getDateInputValue(details?.dataNascimento ?? student?.dataNascimento),
    telefoneWhatsapp: details?.telefoneWhatsapp ?? escuta?.telefoneWhatsapp ?? phone ?? "",
    emailPessoal: details?.emailPessoal ?? escuta?.emailPessoal ?? "",
    outroContato: details?.outroContato ?? escuta?.outroContato ?? "",
    formaPreferencialContato:
      details?.formaPreferencialContato ?? escuta?.formaPreferencialContato ?? "Whatsapp",
    cursoId: student?.cursoAtual?.id ?? "",
    matricula:
      student?.cursoAtual?.matricula ??
      details?.pessoaInstitucional.matricula ??
      sessionMatricula,
    emailInstitucional:
      details?.pessoaInstitucional.emailInstitucional ??
      student?.pessoaInstitucional.emailInstitucional ??
      sessionEmail,
    modalidadeCurso: details?.modalidadeCurso ?? escuta?.modalidadeCurso ?? "Bacharelado",
    ofertaCurso: details?.ofertaCurso ?? escuta?.ofertaCurso ?? "Regular",
    tipoOfertaEspecial:
      typeof details?.respostasQuestionarioCadastro?.tipo_oferta_especial === "string"
        ? details.respostasQuestionarioCadastro.tipo_oferta_especial
        : typeof escuta?.respostasQuestionarioCadastro?.tipo_oferta_especial === "string"
          ? escuta.respostasQuestionarioCadastro.tipo_oferta_especial
          : "",
  };
}

function buildStudentCadastroPayload(
  values: CadastroValues,
  course: Course,
  questionarioCadastroId: string,
  questionarioCadastroVersao: string,
  respostasQuestionarioCadastro: RespostasQuestionarioCadastro,
): CreateStudentBodyApiDto {
  const contatosTelefonicos = values.telefoneWhatsapp
    ? [
        {
          telefone: values.telefoneWhatsapp,
          formaPreferencialContato: true,
          descricao: "Whatsapp",
        },
      ]
    : [];

  return {
    nome: values.nome,
    emailInstitucional: values.emailInstitucional,
    matricula: values.matricula,
    unidadeAcademicaId: course.unidadeAcademica.id,
    ...(values.dataNascimento ? { dataNascimento: values.dataNascimento } : {}),
    ...(contatosTelefonicos.length ? { contatosTelefonicos } : {}),
    telefoneWhatsapp: values.telefoneWhatsapp,
    emailPessoal: values.emailPessoal,
    outroContato: values.outroContato,
    formaPreferencialContato: values.formaPreferencialContato,
    modalidadeCurso: values.modalidadeCurso,
    ofertaCurso: values.ofertaCurso,
    questionarioCadastroId,
    questionarioCadastroVersao,
    respostasQuestionarioCadastro,
    finalizarCadastroInicial: true,
  };
}

function getCourseById(courses: Course[], courseId: string) {
  return courses.find((course) => course.id === courseId);
}

export function MeusDadosPage() {
  const session = useAuthSession();
  const payload = session?.payload;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const studentEmail = payload?.emailInstitucional ?? "";
  const studentsQuery = useStudents(
    {
      page: 1,
      pageSize: 1,
      emailInstitucional: studentEmail,
    },
    Boolean(studentEmail),
  );
  const student = studentsQuery.data?.data[0] ?? null;
  const studentDetailsQuery = useStudent(student?.id);
  const coursesQuery = useCourses({ page: 1, pageSize: 100, ativo: true });
  const enrollmentsQuery = useCourseEnrollments(
    {
      page: 1,
      pageSize: 1,
      estudanteId: student?.id,
      status: "ATIVA",
    },
    Boolean(student?.id),
  );
  const classGroupStudentsQuery = useClassGroupStudents(
    {
      page: 1,
      pageSize: 100,
      estudanteId: student?.id,
    },
    Boolean(student?.id),
  );
  const escutasQuery = useEscutas(
    {
      page: 1,
      pageSize: 5,
      estudanteId: student?.id,
    },
    Boolean(student?.id),
  );
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const createEnrollmentMutation = useCreateCourseEnrollment();
  const updateEnrollmentMutation = useUpdateCourseEnrollment();
  const createClassGroupStudentMutation = useCreateClassGroupStudent();
  const deleteClassGroupStudentMutation = useDeleteClassGroupStudent();
  const createEscutaMutation = useCreateEscuta();
  const courses = coursesQuery.data?.data ?? [];
  const escuta = getLatestEscuta(escutasQuery.data?.data ?? []);
  const activeEnrollment = enrollmentsQuery.data?.data[0];
  const linkedDisciplines = classGroupStudentsQuery.data?.data ?? [];
  const isSubmitting =
    createStudentMutation.isPending ||
    updateStudentMutation.isPending ||
    createEnrollmentMutation.isPending ||
    updateEnrollmentMutation.isPending ||
    createClassGroupStudentMutation.isPending ||
    deleteClassGroupStudentMutation.isPending ||
    createEscutaMutation.isPending;
  const studentName = getDisplayName(student, payload?.nome ?? "");
  const initialValues = useMemo(
    () =>
      buildInitialValues({
        sessionName: payload?.nome ?? "",
        sessionEmail: payload?.emailInstitucional ?? "",
        sessionMatricula: payload?.matricula ?? "",
        student,
        details: studentDetailsQuery.data,
        escuta,
      }),
    [
      escuta,
      payload?.emailInstitucional,
      payload?.matricula,
      payload?.nome,
      student,
      studentDetailsQuery.data,
    ],
  );
  const schedule = getDateTimeParts(escuta?.agendadaPara);
  const completedRegistration = Boolean(
    studentDetailsQuery.data?.cadastroInicialFinalizadoEm ??
      student?.cadastroInicialFinalizadoEm,
  );
  const requestedListening = Boolean(escuta && escuta.status !== "CANCELADA");
  const canEditRegistration = !requestedListening;
  const canRequestListening = Boolean(student?.id && completedRegistration && !requestedListening);
  const isRegistrationDataLoading = Boolean(student?.id) && classGroupStudentsQuery.isLoading;

  const syncClassGroups = async (estudanteId: string, selectedClassGroupIds: string[]) => {
    const selectedIds = new Set(selectedClassGroupIds);
    const currentLinks = student?.id === estudanteId ? linkedDisciplines : [];
    const currentIds = new Set(currentLinks.map((link) => link.turma.id));
    const linksToRemove = currentLinks.filter((link) => !selectedIds.has(link.turma.id));
    const idsToAdd = selectedClassGroupIds.filter((id) => !currentIds.has(id));

    await Promise.all([
      ...linksToRemove.map((link) => deleteClassGroupStudentMutation.mutateAsync(link.id)),
      ...idsToAdd.map((turmaId) =>
        createClassGroupStudentMutation.mutateAsync({
          estudanteId,
          turmaId,
        }),
      ),
    ]);
  };

  const handleSubmitCadastro = async (
    values: CadastroValues,
    selectedClassGroupIds: string[],
    questionarioCadastroId: string,
    questionarioCadastroVersao: string,
    respostasQuestionarioCadastro: RespostasQuestionarioCadastro,
  ) => {
    const course = getCourseById(courses, values.cursoId);

    if (!course) {
      toast.error("Selecione um curso válido.");
      return;
    }

    if (!canEditRegistration) {
      toast.error("Os dados pessoais ficam bloqueados apos a solicitacao da escuta.");
      return;
    }

    try {
      let currentStudentId = student?.id;
      const cadastroPayload = buildStudentCadastroPayload(
        values,
        course,
        questionarioCadastroId,
        questionarioCadastroVersao,
        respostasQuestionarioCadastro,
      );

      if (currentStudentId) {
        await updateStudentMutation.mutateAsync({
          id: currentStudentId,
          data: cadastroPayload,
        });
      } else {
        const createdStudent = await createStudentMutation.mutateAsync(cadastroPayload);
        currentStudentId = createdStudent.id;
      }

      if (activeEnrollment) {
        await updateEnrollmentMutation.mutateAsync({
          id: activeEnrollment.id,
          data: {
            cursoId: values.cursoId,
            matricula: values.matricula,
            status: "ATIVA",
          },
        });
      } else {
        await createEnrollmentMutation.mutateAsync({
          estudanteId: currentStudentId,
          cursoId: values.cursoId,
          matricula: values.matricula,
          matriculadoEm: new Date().toISOString(),
          status: "ATIVA",
        });
      }

      if (!currentStudentId) {
        throw new Error("Não foi possível identificar o aluno.");
      }

      await syncClassGroups(currentStudentId, selectedClassGroupIds);

      toast.success("Cadastro inicial salvo com sucesso.");
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a solicitação de escuta.",
      );
    }
  };

  const handleSolicitarEscuta = async () => {
    if (!student?.id || !completedRegistration) {
      toast.error("Finalize o cadastro inicial antes de solicitar a escuta.");
      return;
    }

    if (requestedListening) {
      toast.info("Sua escuta ja foi solicitada.");
      return;
    }

    try {
      await createEscutaMutation.mutateAsync({
        estudanteId: student.id,
        consentimento: true,
      });
      toast.success("Escuta solicitada com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel solicitar a escuta.");
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.statusCard}>
        <div>
          <h2>Bem vindo ao NIPNE!</h2>
          <p>
            {escuta?.status === "AGENDADA"
              ? "Sua escuta foi agendada."
              : requestedListening
                ? "Aguardando resposta da sua coordenadoria para agendar a escuta."
                : completedRegistration
                  ? "Seu cadastro foi realizado. Solicite sua escuta para finalizar o fluxo."
                  : "Ainda faltam algumas etapas para finalizar o seu cadastro e ter acesso completo ao sistema."}
          </p>
          <ol className={styles.steps}>
            <li className={completedRegistration ? styles.doneStep : ""}>Finalizar cadastro</li>
            <li className={requestedListening ? styles.doneStep : ""}>Agendar a escuta</li>
          </ol>
        </div>

        {escuta?.status === "AGENDADA" ? (
          <div className={styles.scheduleBox}>
            <span>Data</span>
            <strong>
              <EventAvailableOutlinedIcon fontSize="small" />
              {schedule.date}
            </strong>
            <span>Hora</span>
            <strong>{schedule.time}</strong>
          </div>
        ) : null}

        <div className={styles.statusActions}>
          {!completedRegistration ? (
            <Button
              variant="contained"
              onClick={() => setIsDrawerOpen(true)}
              disabled={coursesQuery.isLoading || isRegistrationDataLoading}
            >
              Finalizar cadastro
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => setIsDrawerOpen(true)}
                disabled={
                  !canEditRegistration || coursesQuery.isLoading || isRegistrationDataLoading
                }
              >
                Atualizar dados
              </Button>
              <Button
                variant="contained"
                onClick={handleSolicitarEscuta}
                disabled={!canRequestListening || createEscutaMutation.isPending}
              >
                Solicitar escuta
              </Button>
            </>
          )}
        </div>
      </section>

      {student ? (
        <section className={styles.details}>
          <div className={styles.tabs}>
            <span className={styles.activeTab}>Dados Gerais</span>
            <span>Avaliação</span>
          </div>

          <h2>Identificação Pessoal</h2>
          <dl className={styles.detailGrid}>
            <div>
              <dt>Nome</dt>
              <dd>{studentName}</dd>
            </div>
            <div>
              <dt>Data de Nascimento</dt>
              <dd>{formatDatePtBr(student.dataNascimento) || "-"}</dd>
            </div>
            <div>
              <dt>Telefone (Whatsapp)</dt>
              <dd>{initialValues.telefoneWhatsapp || "-"}</dd>
            </div>
            <div>
              <dt>E-mail pessoal</dt>
              <dd>{initialValues.emailPessoal || "-"}</dd>
            </div>
            <div>
              <dt>Outro contato</dt>
              <dd>{initialValues.outroContato || "-"}</dd>
            </div>
            <div>
              <dt>Forma preferencial de contato</dt>
              <dd>{initialValues.formaPreferencialContato || "-"}</dd>
            </div>
          </dl>

          <h2>Identificação Acadêmica</h2>
          <dl className={styles.detailGrid}>
            <div>
              <dt>Curso</dt>
              <dd>{student.cursoAtual?.nome ?? "-"}</dd>
            </div>
            <div>
              <dt>Matrícula</dt>
              <dd>{student.cursoAtual?.matricula ?? student.pessoaInstitucional.matricula}</dd>
            </div>
            <div>
              <dt>E-mail institucional</dt>
              <dd>{student.pessoaInstitucional.emailInstitucional}</dd>
            </div>
            <div>
              <dt>Modalidade do curso</dt>
              <dd>{initialValues.modalidadeCurso || "-"}</dd>
            </div>
            <div>
              <dt>Oferta do curso</dt>
              <dd>{initialValues.ofertaCurso || "-"}</dd>
            </div>
            {initialValues.ofertaCurso === "Especial" ? (
              <div>
                <dt>Tipo da oferta especial</dt>
                <dd>{formatTipoOfertaEspecial(initialValues.tipoOfertaEspecial)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Status da escuta</dt>
              <dd>{getStatusText(escuta)}</dd>
            </div>
          </dl>

          <div className={styles.disciplineHeader}>
            <h3>Disciplinas</h3>
            <span>Matriculado em {linkedDisciplines.length} disciplina(s)</span>
          </div>
          <div className={styles.disciplineTable}>
            <div className={styles.disciplineRowHeader}>
              <span>Nome</span>
              <span>Professor</span>
            </div>
            {linkedDisciplines.length ? (
              linkedDisciplines.map((link) => (
                <div className={styles.disciplineRow} key={link.id}>
                  <span>{link.turma.disciplina.nome}</span>
                  <span>
                    {link.turma.professores
                      .map(
                        (professor) =>
                          professor.pessoaInstitucional.nomeSocial ||
                          professor.pessoaInstitucional.nome,
                      )
                      .join(", ") || "-"}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Nenhuma disciplina vinculada.</p>
            )}
          </div>
        </section>
      ) : (
        <section className={styles.emptyState}>
          <AssignmentTurnedInOutlinedIcon />
          <h2>Para ver seus dados, finalize o seu cadastro.</h2>
        </section>
      )}

      {isDrawerOpen ? (
        <CadastroEscutaDrawer
          key={`${student?.id ?? "novo"}-${escuta?.id ?? "sem-escuta"}`}
          open={isDrawerOpen}
          courses={courses}
          initialValues={initialValues}
          initialSelectedClassGroupIds={linkedDisciplines.map((link) => link.turma.id)}
          linkedClassGroups={linkedDisciplines}
          initialQuestionarioAnswers={
            studentDetailsQuery.data?.respostasQuestionarioCadastro ??
            escuta?.respostasQuestionarioCadastro ??
            {}
          }
          isSubmitting={isSubmitting}
          onClose={() => setIsDrawerOpen(false)}
          onSubmit={handleSubmitCadastro}
        />
      ) : null}
    </div>
  );
}

export default MeusDadosPage;
