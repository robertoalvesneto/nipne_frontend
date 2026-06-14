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
import type { ClassGroupStudent } from "@/modules/aluno/interfaces/class-group-student";
import type { Course } from "@/modules/aluno/interfaces/course";
import type { Student, StudentListItem } from "@/modules/aluno/interfaces/student";
import type { CreateStudentBodyApiDto } from "@/modules/aluno/services/create-student-service";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { formatPhone } from "@/shared/utils/phone-mask";
import { formatRegistration, getSafeRegistration } from "@/shared/utils/registration";
import { useCreateEscuta } from "../../hooks/use-create-escuta";
import { useEscutas } from "../../hooks/use-get-escutas";
import { useQuestionarioCadastro } from "../../hooks/use-get-questionario-cadastro";
import { useQuestionarioEscuta } from "../../hooks/use-get-questionario-escuta";
import type { Escuta } from "../../interfaces/escuta";
import type {
  PerguntaQuestionario,
  QuestionarioCadastro,
  QuestionarioEscuta,
  RespostasQuestionarioCadastro,
  RespostasQuestionarioEscuta,
} from "../../interfaces/questionario-cadastro";
import { CadastroEscutaDrawer } from "./cadastro-escuta-drawer";
import type { CadastroValues } from "./cadastro-escuta-types";
import styles from "./meus-dados-page.module.css";

type MeusDadosTab = "gerais" | "cadastro" | "escuta" | "paai";
type QuestionnaireAnswers = RespostasQuestionarioCadastro | RespostasQuestionarioEscuta;
type Questionario = QuestionarioCadastro | QuestionarioEscuta;

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
    telefoneWhatsapp: formatPhone(details?.telefoneWhatsapp ?? escuta?.telefoneWhatsapp ?? phone ?? ""),
    emailPessoal: details?.emailPessoal ?? escuta?.emailPessoal ?? "",
    outroContato: details?.outroContato ?? escuta?.outroContato ?? "",
    formaPreferencialContato:
      details?.formaPreferencialContato ?? escuta?.formaPreferencialContato ?? "Whatsapp",
    cursoId: student?.cursoAtual?.id ?? "",
    matricula: getSafeRegistration(
      student?.cursoAtual?.matricula,
      details?.pessoaInstitucional.matricula,
      sessionMatricula,
    ),
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
          telefone: formatPhone(values.telefoneWhatsapp),
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
    telefoneWhatsapp: formatPhone(values.telefoneWhatsapp),
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

function getAllQuestions(questionario?: Questionario | null) {
  return questionario?.secoes.flatMap((secao) => secao.perguntas) ?? [];
}

function getStringAnswer(respostas: QuestionnaireAnswers | null | undefined, key: string) {
  const value = respostas?.[key];

  return typeof value === "string" ? value.trim() : "";
}

function getArrayAnswer(respostas: QuestionnaireAnswers | null | undefined, key: string) {
  const value = respostas?.[key];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function hasAnswerValue(answer: unknown) {
  if (typeof answer === "string") {
    return answer.trim().length > 0;
  }

  if (Array.isArray(answer)) {
    return answer.some((item) => typeof item !== "string" || item.trim().length > 0);
  }

  return answer !== null && answer !== undefined;
}

function hasStoredAnswers(respostas: QuestionnaireAnswers | null | undefined) {
  return Boolean(respostas && Object.values(respostas).some(hasAnswerValue));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isYesAnswer(value: string | null | undefined) {
  return normalizeText(value ?? "") === "sim";
}

function matchesQuestionCondition(pergunta: PerguntaQuestionario, respostas: QuestionnaireAnswers) {
  if (!pergunta.condicao) {
    return true;
  }

  const answer = respostas[pergunta.condicao.perguntaId];
  const expected = pergunta.condicao.valor;

  if (pergunta.condicao.operador === "igual") {
    return answer === expected;
  }

  if (!Array.isArray(answer)) {
    return false;
  }

  if (pergunta.condicao.operador === "contem") {
    return typeof expected === "string" && answer.includes(expected);
  }

  return Array.isArray(expected) && expected.some((value) => answer.includes(value));
}

function getOptionLabel(questionario: Questionario, key: string, value: string) {
  const question = getAllQuestions(questionario).find((pergunta) => pergunta.id === key);

  return question?.opcoes?.find((opcao) => opcao.valor === value)?.rotulo ?? value;
}

function getProfessorNames(link: ClassGroupStudent) {
  const names = link.turma.professores.map(
    (professor) =>
      professor.pessoaInstitucional.nomeSocial?.trim() ||
      professor.pessoaInstitucional.nome,
  );

  return names.join(", ") || "-";
}

function getDisciplineAnswerItems(
  respostas: QuestionnaireAnswers,
  pergunta: PerguntaQuestionario,
  linkedDisciplines: ClassGroupStudent[],
) {
  const selectedIds = getArrayAnswer(respostas, pergunta.id);
  const selectedDisciplines = selectedIds.length
    ? linkedDisciplines.filter((link) => selectedIds.includes(link.turma.id))
    : linkedDisciplines;

  return selectedDisciplines.map((link) => {
    const professorNames = getProfessorNames(link);

    return `${link.turma.disciplina.nome}${professorNames === "-" ? "" : ` - ${professorNames}`}`;
  });
}

function getQuestionAnswerItems(
  questionario: Questionario,
  pergunta: PerguntaQuestionario,
  respostas: QuestionnaireAnswers,
  linkedDisciplines: ClassGroupStudent[],
) {
  if (pergunta.tipo === "disciplinas") {
    return getDisciplineAnswerItems(respostas, pergunta, linkedDisciplines);
  }

  if (pergunta.tipo === "selecao_multipla") {
    const answers = getArrayAnswer(respostas, pergunta.id);
    const orderedAnswers = pergunta.opcoes?.length
      ? [
          ...pergunta.opcoes.map((opcao) => opcao.valor).filter((value) => answers.includes(value)),
          ...answers.filter(
            (value) => !pergunta.opcoes?.some((opcao) => opcao.valor === value),
          ),
        ]
      : answers;
    const labels = orderedAnswers
      .filter((value) => value !== "outro")
      .map((value) => getOptionLabel(questionario, pergunta.id, value));
    const other = getStringAnswer(respostas, `${pergunta.id}_outro`);

    return other ? [...labels, other] : labels;
  }

  if (pergunta.tipo === "selecao_unica") {
    const answer = getStringAnswer(respostas, pergunta.id);
    const other = getStringAnswer(respostas, `${pergunta.id}_outro`);

    if (answer === "outro" && other) {
      return [other];
    }

    return answer ? [getOptionLabel(questionario, pergunta.id, answer)] : [];
  }

  const answer = getStringAnswer(respostas, pergunta.id);

  if (!answer) {
    return [];
  }

  if (pergunta.tipo === "data") {
    return [formatDatePtBr(answer) || answer];
  }

  return answer
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function AnswerItems({ items }: { items: string[] }) {
  if (!items.length) {
    return <span>-</span>;
  }

  return (
    <ul className={styles.answerList}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function isCompactAnswer(pergunta: PerguntaQuestionario, items: string[]) {
  if (
    pergunta.tipo === "disciplinas" ||
    pergunta.tipo === "selecao_multipla" ||
    pergunta.tipo === "texto_longo"
  ) {
    return false;
  }

  const value = items[0] ?? "";

  return items.length <= 1 && value.length <= 90;
}

function SingleAnswer({ items }: { items: string[] }) {
  return <span>{items[0] || "-"}</span>;
}

interface QuestionnaireAnswersPanelProps {
  emptyMessage: string;
  isLoading?: boolean;
  linkedDisciplines: ClassGroupStudent[];
  questionario?: Questionario | null;
  respostas?: QuestionnaireAnswers | null;
}

function QuestionnaireAnswersPanel({
  emptyMessage,
  isLoading = false,
  linkedDisciplines,
  questionario,
  respostas,
}: QuestionnaireAnswersPanelProps) {
  if (isLoading) {
    return <p className={styles.emptyText}>Carregando respostas...</p>;
  }

  if (!questionario) {
    return <p className={styles.emptyText}>Questionário indisponível no momento.</p>;
  }

  const answers = respostas ?? {};

  if (!hasStoredAnswers(answers)) {
    return <p className={styles.emptyText}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.questionnaireAnswers}>
      {questionario.secoes.map((secao) => {
        const visibleQuestions = secao.perguntas.filter((pergunta) =>
          matchesQuestionCondition(pergunta, answers),
        );
        const displayAnswers = visibleQuestions.map((pergunta) => {
          const items = getQuestionAnswerItems(
            questionario,
            pergunta,
            answers,
            linkedDisciplines,
          );

          return {
            pergunta,
            items,
            isCompact: isCompactAnswer(pergunta, items),
          };
        });
        const compactAnswers = displayAnswers.filter((answer) => answer.isCompact);
        const expandedAnswers = displayAnswers.filter((answer) => !answer.isCompact);

        if (!visibleQuestions.length) {
          return null;
        }

        return (
          <section className={styles.questionnaireSectionPanel} key={secao.id}>
            <h2>{secao.titulo}</h2>
            {compactAnswers.length ? (
              <dl className={styles.questionnaireGrid}>
                {compactAnswers.map(({ pergunta, items }) => (
                  <div className={styles.questionnaireAnswer} key={pergunta.id}>
                    <dt>{pergunta.titulo}</dt>
                    <dd>
                      <SingleAnswer items={items} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {expandedAnswers.length ? (
              <dl className={styles.questionnaireList}>
                {expandedAnswers.map(({ pergunta, items }) => (
                  <div className={styles.questionnaireAnswer} key={pergunta.id}>
                    <dt>{pergunta.titulo}</dt>
                    <dd>
                      <AnswerItems items={items} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

interface PaaiAnswersPanelProps {
  escuta: Escuta;
  questionarioEscuta?: QuestionarioEscuta | null;
}

function PaaiAnswersPanel({ escuta, questionarioEscuta }: PaaiAnswersPanelProps) {
  const respostas = escuta.respostasQuestionarioEscuta ?? {};
  const resumoCaso = escuta.resumoCaso ?? getStringAnswer(respostas, "resumo_caso");
  const classificacaoApoio =
    escuta.classificacaoApoio ??
    (questionarioEscuta
      ? getOptionLabel(
          questionarioEscuta,
          "classificacao_apoio",
          getStringAnswer(respostas, "classificacao_apoio"),
        )
      : getStringAnswer(respostas, "classificacao_apoio"));
  const necessidadePaai =
    escuta.necessitaPaai ??
    (questionarioEscuta
      ? getOptionLabel(
          questionarioEscuta,
          "necessita_paai",
          getStringAnswer(respostas, "necessita_paai"),
        )
      : getStringAnswer(respostas, "necessita_paai"));
  const encaminhamentosQuestion = getAllQuestions(questionarioEscuta).find(
    (pergunta) => pergunta.id === "encaminhamentos",
  );
  const encaminhamentos = uniqueStrings([
    ...((escuta.encaminhamentos ?? []).length
      ? escuta.encaminhamentos
      : encaminhamentosQuestion && questionarioEscuta
        ? getQuestionAnswerItems(questionarioEscuta, encaminhamentosQuestion, respostas, [])
        : getArrayAnswer(respostas, "encaminhamentos")),
    escuta.outrosEncaminhamentos ?? "",
  ]);
  const responsible = getStringAnswer(respostas, "responsavel_escuta");
  const date = formatDatePtBr(escuta.realizadaEm ?? escuta.updatedAt) || "-";

  return (
    <div className={styles.questionnaireAnswers}>
      <section className={styles.questionnaireSectionPanel}>
        <h2>PAAI</h2>
        <dl className={styles.questionnaireGrid}>
          <div className={styles.questionnaireAnswer}>
            <dt>Classificação do nível de apoio</dt>
            <dd>
              <SingleAnswer items={classificacaoApoio ? [classificacaoApoio] : []} />
            </dd>
          </div>
          <div className={styles.questionnaireAnswer}>
            <dt>Necessidade de PAAI</dt>
            <dd>
              <SingleAnswer items={necessidadePaai ? [necessidadePaai] : []} />
            </dd>
          </div>
          <div className={styles.questionnaireAnswer}>
            <dt>Responsável pela escuta</dt>
            <dd>
              <SingleAnswer items={responsible ? [responsible] : []} />
            </dd>
          </div>
          <div className={styles.questionnaireAnswer}>
            <dt>Data da escuta</dt>
            <dd>
              <SingleAnswer items={[date]} />
            </dd>
          </div>
        </dl>
        <dl className={styles.questionnaireList}>
          <div className={styles.questionnaireAnswer}>
            <dt>Observações específicas do caso</dt>
            <dd>
              <AnswerItems items={resumoCaso ? [resumoCaso] : []} />
            </dd>
          </div>
          <div className={styles.questionnaireAnswer}>
            <dt>Encaminhamentos</dt>
            <dd>
              <AnswerItems items={encaminhamentos} />
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export function MeusDadosPage() {
  const session = useAuthSession();
  const payload = session?.payload;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MeusDadosTab>("gerais");
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
  const questionarioCadastroQuery = useQuestionarioCadastro();
  const questionarioEscutaQuery = useQuestionarioEscuta(Boolean(student?.id));
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const createEnrollmentMutation = useCreateCourseEnrollment();
  const updateEnrollmentMutation = useUpdateCourseEnrollment();
  const createClassGroupStudentMutation = useCreateClassGroupStudent();
  const deleteClassGroupStudentMutation = useDeleteClassGroupStudent();
  const createEscutaMutation = useCreateEscuta();
  const courses = coursesQuery.data?.data ?? [];
  const escuta = getLatestEscuta(escutasQuery.data?.data ?? []);
  const cadastroAnswers =
    studentDetailsQuery.data?.respostasQuestionarioCadastro ??
    escuta?.respostasQuestionarioCadastro ??
    null;
  const escutaAnswers = escuta?.respostasQuestionarioEscuta ?? null;
  const hasEscutaAnswers = hasStoredAnswers(escutaAnswers);
  const canShowPaai =
    hasEscutaAnswers &&
    (isYesAnswer(getStringAnswer(escutaAnswers, "necessita_paai")) ||
      isYesAnswer(escuta?.necessitaPaai));
  const displayedTab: MeusDadosTab =
    activeTab === "paai" && !canShowPaai
      ? hasEscutaAnswers
        ? "escuta"
        : "cadastro"
      : activeTab === "escuta" && !hasEscutaAnswers
        ? "cadastro"
        : activeTab;
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
          <nav className={styles.tabs} aria-label="Seções de meus dados">
            <button
              type="button"
              className={displayedTab === "gerais" ? styles.activeTab : ""}
              onClick={() => setActiveTab("gerais")}
            >
              Dados Gerais
            </button>
            <button
              type="button"
              className={displayedTab === "cadastro" ? styles.activeTab : ""}
              onClick={() => setActiveTab("cadastro")}
            >
              Cadastro Inicial
            </button>
            {hasEscutaAnswers ? (
              <button
                type="button"
                className={displayedTab === "escuta" ? styles.activeTab : ""}
                onClick={() => setActiveTab("escuta")}
              >
                Escuta
              </button>
            ) : null}
            {canShowPaai ? (
              <button
                type="button"
                className={displayedTab === "paai" ? styles.activeTab : ""}
                onClick={() => setActiveTab("paai")}
              >
                PAAI
              </button>
            ) : null}
          </nav>

          {displayedTab === "gerais" ? (
            <>
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
              <dd>
                {formatRegistration(
                  student.cursoAtual?.matricula,
                  student.pessoaInstitucional.matricula,
                )}
              </dd>
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
                  <span>{getProfessorNames(link)}</span>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Nenhuma disciplina vinculada.</p>
            )}
          </div>
            </>
          ) : null}

          {displayedTab === "cadastro" ? (
            <QuestionnaireAnswersPanel
              emptyMessage="Nenhuma resposta do cadastro inicial encontrada."
              isLoading={questionarioCadastroQuery.isLoading}
              linkedDisciplines={linkedDisciplines}
              questionario={questionarioCadastroQuery.data}
              respostas={cadastroAnswers}
            />
          ) : null}

          {displayedTab === "escuta" ? (
            <QuestionnaireAnswersPanel
              emptyMessage="Nenhuma resposta da escuta encontrada."
              isLoading={questionarioEscutaQuery.isLoading}
              linkedDisciplines={linkedDisciplines}
              questionario={questionarioEscutaQuery.data}
              respostas={escutaAnswers}
            />
          ) : null}

          {displayedTab === "paai" && escuta ? (
            <PaaiAnswersPanel escuta={escuta} questionarioEscuta={questionarioEscutaQuery.data} />
          ) : null}
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
