"use client";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Tooltip,
  type SelectChangeEvent,
} from "@mui/material";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useClassGroupStudents } from "@/modules/aluno/hooks/use-get-class-group-students";
import type { ClassGroupStudent } from "@/modules/aluno/interfaces/class-group-student";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { PaginationControls } from "@/shared/components/pagination-controls/pagination-controls";
import { Table, type TableColumn } from "@/shared/components/table/table";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { useFinishEscutaQuestionario } from "../../hooks/use-finish-escuta-questionario";
import { useEscutas } from "../../hooks/use-get-escutas";
import { useQuestionarioEscuta } from "../../hooks/use-get-questionario-escuta";
import { useScheduleEscuta } from "../../hooks/use-schedule-escuta";
import type { Escuta, StatusEscuta } from "../../interfaces/escuta";
import type {
  PerguntaQuestionario,
  QuestionarioEscuta,
  RespostasQuestionarioEscuta,
} from "../../interfaces/questionario-cadastro";
import type { FinishEscutaQuestionarioBodyApiDto } from "../../services/finish-escuta-questionario-service";
import styles from "./escutas-page.module.css";

type StatusFilter = "TODAS" | StatusEscuta;
type DetailsTab = "gerais" | "paai" | "escuta";

type QuestionnaireValues = {
  temTutor: "SIM" | "NAO";
  nomeTutor: string;
  telefoneTutor: string;
  resumoCaso: string;
  classificacaoApoio: string;
  necessitaPaai: string;
  encaminhamentos: string[];
  outrosEncaminhamentos: string;
};

const pageSize = 10;

const statusLabels = {
  SOLICITADA: "Solicitado",
  AGENDADA: "Agendado",
  REALIZADA: "Concluído",
  CANCELADA: "Cancelado",
} satisfies Record<StatusEscuta, string>;

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "Todos", value: "TODAS" },
  { label: "Solicitados", value: "SOLICITADA" },
  { label: "Agendados", value: "AGENDADA" },
  { label: "Concluídos", value: "REALIZADA" },
  { label: "Cancelados", value: "CANCELADA" },
];

const formaIngressoLabels: Record<string, string> = {
  enem: "ENEM",
  sis: "SIS",
  vestibular: "Vestibular",
  cota: "Cota",
  transferencia: "Transferencia",
  outro: "Outro",
};

function getStudentName(escuta: Escuta) {
  return (
    escuta.estudante.pessoaInstitucional.nomeSocial?.trim() ||
    escuta.estudante.pessoaInstitucional.nome
  );
}

function getDateTimeParts(date?: string | null) {
  if (!date) {
    return { date: "-", time: "" };
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "-", time: "" };
  }

  return {
    date: formatDatePtBr(date) || "-",
    time: parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getQuestionnaireText(escuta: Escuta, key: string) {
  const value = escuta.respostasQuestionarioCadastro?.[key];

  if (typeof value !== "string") {
    return "-";
  }

  const normalized = value.trim();

  if (!normalized) {
    return "-";
  }

  return formaIngressoLabels[normalized] ?? normalized;
}

function getProfessorNames(link: ClassGroupStudent) {
  const names = link.turma.professores.map(
    (professor) =>
      professor.pessoaInstitucional.nomeSocial?.trim() ||
      professor.pessoaInstitucional.nome,
  );

  return names.join(", ") || "-";
}

function getDisplayDateTime(escuta: Escuta) {
  return getDateTimeParts(escuta.agendadaPara ?? escuta.createdAt);
}

function getDateInputValue(date?: string | null) {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function getTimeInputValue(date?: string | null) {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildLegacyQuestionnaireInitialValues(escuta: Escuta): QuestionnaireValues {
  return {
    temTutor: escuta.temTutor === false ? "NAO" : "SIM",
    nomeTutor: escuta.nomeTutor ?? "",
    telefoneTutor: escuta.telefoneTutor ?? "",
    resumoCaso: escuta.resumoCaso ?? "",
    classificacaoApoio: escuta.classificacaoApoio ?? "Baixo",
    necessitaPaai: escuta.necessitaPaai ?? "Sim",
    encaminhamentos: escuta.encaminhamentos.length
      ? escuta.encaminhamentos
      : ["Orientação Docente"],
    outrosEncaminhamentos: escuta.outrosEncaminhamentos ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildLegacyQuestionnairePayload(
  values: QuestionnaireValues,
): FinishEscutaQuestionarioBodyApiDto {
  return {
    questionarioEscutaId: "",
    questionarioEscutaVersao: "",
    respostasQuestionarioEscuta: {
      temTutor: values.temTutor,
      nomeTutor: values.nomeTutor,
      telefoneTutor: values.telefoneTutor,
      resumoCaso: values.resumoCaso,
      classificacaoApoio: values.classificacaoApoio,
      necessitaPaai: values.necessitaPaai,
      encaminhamentos: values.encaminhamentos,
      outrosEncaminhamentos: values.outrosEncaminhamentos,
    },
    temTutor: values.temTutor === "SIM",
    nomeTutor: values.temTutor === "SIM" ? values.nomeTutor : "",
    telefoneTutor: values.temTutor === "SIM" ? values.telefoneTutor : "",
    resumoCaso: values.resumoCaso,
    classificacaoApoio: values.classificacaoApoio,
    necessitaPaai: values.necessitaPaai,
    encaminhamentos: values.encaminhamentos,
    outrosEncaminhamentos: values.outrosEncaminhamentos,
  };
}

function getAllQuestions(questionario?: QuestionarioEscuta | null) {
  return questionario?.secoes.flatMap((secao) => secao.perguntas) ?? [];
}

function getStringAnswer(respostas: RespostasQuestionarioEscuta | null | undefined, key: string) {
  const value = respostas?.[key];

  return typeof value === "string" ? value.trim() : "";
}

function getArrayAnswer(respostas: RespostasQuestionarioEscuta | null | undefined, key: string) {
  const value = respostas?.[key];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getOptionLabel(
  questionario: QuestionarioEscuta | null | undefined,
  key: string,
  value: string,
) {
  const question = getAllQuestions(questionario).find((pergunta) => pergunta.id === key);

  return question?.opcoes?.find((opcao) => opcao.valor === value)?.rotulo ?? value;
}

function getAnswerLabel(
  questionario: QuestionarioEscuta | null | undefined,
  respostas: RespostasQuestionarioEscuta | null | undefined,
  key: string,
) {
  const answer = getStringAnswer(respostas, key);

  return answer ? getOptionLabel(questionario, key, answer) : "-";
}

function getAnswerLabels(
  questionario: QuestionarioEscuta | null | undefined,
  respostas: RespostasQuestionarioEscuta | null | undefined,
  key: string,
) {
  const labels = getArrayAnswer(respostas, key)
    .filter((value) => value !== "outro")
    .map((value) => getOptionLabel(questionario, key, value));
  const other = getStringAnswer(respostas, `${key}_outro`);

  return other ? [...labels, other] : labels;
}

function matchesQuestionCondition(
  pergunta: PerguntaQuestionario,
  respostas: RespostasQuestionarioEscuta,
) {
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
    return answer.includes(expected);
  }

  return Array.isArray(expected) && expected.some((value) => answer.includes(value));
}

function hasQuestionAnswer(answer: unknown) {
  if (typeof answer === "string") {
    return answer.trim().length > 0;
  }

  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return answer !== undefined && answer !== null;
}

function includesOther(answer: unknown) {
  return answer === "outro" || (Array.isArray(answer) && answer.includes("outro"));
}

function buildQuestionnaireInitialValues(
  escuta: Escuta,
  questionario: QuestionarioEscuta,
): RespostasQuestionarioEscuta {
  const initial: RespostasQuestionarioEscuta = {
    ...(escuta.respostasQuestionarioEscuta ?? {}),
  };

  for (const pergunta of getAllQuestions(questionario)) {
    if (initial[pergunta.id] !== undefined) {
      continue;
    }

    initial[pergunta.id] = pergunta.tipo === "selecao_multipla" ? [] : "";
  }

  return initial;
}

function formatReadOnlyAnswer(
  questionario: QuestionarioEscuta,
  pergunta: PerguntaQuestionario,
  respostas: RespostasQuestionarioEscuta,
) {
  if (pergunta.tipo === "selecao_multipla") {
    return getAnswerLabels(questionario, respostas, pergunta.id).join(", ") || "-";
  }

  if (pergunta.tipo === "selecao_unica") {
    return getAnswerLabel(questionario, respostas, pergunta.id);
  }

  return getStringAnswer(respostas, pergunta.id) || "-";
}

interface ScheduleDialogProps {
  escuta: Escuta | null;
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (date: string, time: string) => Promise<void>;
}

function ScheduleDialog({
  escuta,
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: ScheduleDialogProps) {
  const [date, setDate] = useState(getDateInputValue(escuta?.agendadaPara));
  const [time, setTime] = useState(getTimeInputValue(escuta?.agendadaPara) || "14:00");
  const canSubmit = Boolean(date && time);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    await onSubmit(date, time);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={styles.scheduleTitle}>
        <EventAvailableOutlinedIcon />
        Atenção
      </DialogTitle>
      <DialogContent className={styles.scheduleContent}>
        <p>
          Para agendar a escuta do(a) aluno(a) {escuta ? getStudentName(escuta) : "-"},
          insira a data e hora em que ela será realizada:
        </p>
        <div className={styles.scheduleFields}>
          <TextField
            label="Data"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Hora"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </div>
        <strong>O(a) estudante será alertado(a) desse agendamento</strong>
      </DialogContent>
      <DialogActions className={styles.scheduleActions}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
          Agendar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface DetailFieldProps {
  label: string;
  value: string;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className={styles.detailField}>
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

interface PaaiPreviewPanelProps {
  escuta: Escuta;
  questionarioEscuta: QuestionarioEscuta | null | undefined;
  disciplineLinks: ClassGroupStudent[];
}

function PaaiPreviewPanel({
  escuta,
  questionarioEscuta,
  disciplineLinks,
}: PaaiPreviewPanelProps) {
  const respostas = escuta.respostasQuestionarioEscuta;
  const person = escuta.estudante.pessoaInstitucional;
  const studentName = getStudentName(escuta);
  const avaliacoes = getAnswerLabels(questionarioEscuta, respostas, "barreiras_avaliacoes");
  const didatica = getAnswerLabels(questionarioEscuta, respostas, "barreiras_didatica");
  const materiais = getAnswerLabels(questionarioEscuta, respostas, "barreiras_materiais");
  const impactos = getAnswerLabels(questionarioEscuta, respostas, "impacto_barreiras");
  const encaminhamentos = getAnswerLabels(questionarioEscuta, respostas, "encaminhamentos");

  return (
    <section className={styles.paaiPanel} aria-label="Prévia do PAAI">
      <div className={styles.paaiHeader}>
        <h3>Plano de Acessibilidade Acadêmica Individual - PAAI</h3>
        <span>{getAnswerLabel(questionarioEscuta, respostas, "necessita_paai")}</span>
      </div>

      <dl className={styles.detailGrid}>
        <DetailField label="Nome" value={studentName} />
        <DetailField
          label="Matrícula"
          value={escuta.estudante.cursoAtual?.matricula ?? person.matricula}
        />
        <DetailField label="Curso" value={escuta.estudante.cursoAtual?.nome ?? "-"} />
        <DetailField label="Unidade" value={escuta.estudante.unidadeAcademica.sigla} />
      </dl>

      <div className={styles.readonlySection}>
        <h4>Disciplinas e professores</h4>
        <div className={styles.disciplinesTable}>
          <Table
            ariaLabel="Disciplinas para PAAI"
            columns={[
              {
                key: "disciplina",
                header: "Disciplina",
                render: (link) => link.turma.disciplina.nome,
              },
              {
                key: "professor",
                header: "Professor",
                render: (link) => getProfessorNames(link),
              },
            ]}
            data={disciplineLinks}
            getRowKey={(link) => link.id}
            emptyMessage="Nenhuma disciplina vinculada ao aluno."
          />
        </div>
      </div>

      <div className={styles.readonlySection}>
        <h4>Preferências e necessidades observadas</h4>
        <p>{getStringAnswer(respostas, "resumo_caso") || "-"}</p>
      </div>

      <div className={styles.paaiGuidanceGrid}>
        <div>
          <strong>Avaliações/atividades</strong>
          <p>{avaliacoes.join(", ") || "-"}</p>
        </div>
        <div>
          <strong>Didática e comunicação</strong>
          <p>{didatica.join(", ") || "-"}</p>
        </div>
        <div>
          <strong>Materiais e tecnologia</strong>
          <p>{materiais.join(", ") || "-"}</p>
        </div>
        <div>
          <strong>Impactos acadêmicos</strong>
          <p>{impactos.join(", ") || "-"}</p>
        </div>
      </div>

      <div className={styles.readonlySection}>
        <h4>Encaminhamentos NIPNE</h4>
        <p>{encaminhamentos.join(", ") || "-"}</p>
      </div>
    </section>
  );
}

interface EscutaReadOnlyPanelProps {
  escuta: Escuta;
  questionarioEscuta: QuestionarioEscuta | null | undefined;
}

function EscutaReadOnlyPanel({ escuta, questionarioEscuta }: EscutaReadOnlyPanelProps) {
  const respostas = escuta.respostasQuestionarioEscuta ?? {};

  if (!questionarioEscuta || !escuta.respostasQuestionarioEscuta) {
    return (
      <section className={styles.paaiPanel} aria-label="Escuta realizada">
        <dl className={styles.detailGrid}>
          <DetailField
            label="Tutor de apoio"
            value={escuta.temTutor === null ? "-" : escuta.temTutor ? "Sim" : "Não"}
          />
          <DetailField label="Nome do tutor" value={escuta.nomeTutor ?? "-"} />
          <DetailField label="Telefone do tutor" value={escuta.telefoneTutor ?? "-"} />
          <DetailField label="Classificação do apoio" value={escuta.classificacaoApoio ?? "-"} />
          <DetailField label="Necessita PAAI" value={escuta.necessitaPaai ?? "-"} />
          <DetailField label="Encaminhamentos" value={escuta.encaminhamentos.join(", ") || "-"} />
        </dl>
        <DetailField label="Resumo do caso" value={escuta.resumoCaso ?? "-"} />
      </section>
    );
  }

  return (
    <section className={styles.readonlyAnswers} aria-label="Respostas da escuta">
      {questionarioEscuta.secoes.map((secao) => {
        const visibleQuestions = secao.perguntas.filter((pergunta) =>
          matchesQuestionCondition(pergunta, respostas),
        );

        if (!visibleQuestions.length) {
          return null;
        }

        return (
          <div className={styles.readonlySection} key={secao.id}>
            <h3>{secao.titulo}</h3>
            <dl className={styles.readonlyList}>
              {visibleQuestions.map((pergunta) => (
                <div className={styles.readonlyAnswer} key={pergunta.id}>
                  <dt>{pergunta.titulo}</dt>
                  <dd>{formatReadOnlyAnswer(questionarioEscuta, pergunta, respostas)}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </section>
  );
}

interface EscutaDetailsDrawerProps {
  escuta: Escuta | null;
  questionarioEscuta: QuestionarioEscuta | null | undefined;
  open: boolean;
  onClose: () => void;
  onExport: (escuta: Escuta) => void;
  onOpenQuestionnaire: (escuta: Escuta) => void;
  onSchedule: (escuta: Escuta) => void;
}

function EscutaDetailsDrawer({
  escuta,
  questionarioEscuta,
  open,
  onClose,
  onExport,
  onOpenQuestionnaire,
  onSchedule,
}: EscutaDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<DetailsTab>("gerais");
  const classGroupStudentsQuery = useClassGroupStudents(
    {
      estudanteId: escuta?.estudante.id,
      pageSize: 100,
    },
    open && Boolean(escuta?.estudante.id),
  );
  const disciplineLinks = classGroupStudentsQuery.data?.data ?? [];

  if (!escuta) {
    return null;
  }

  const displaySchedule = getDisplayDateTime(escuta);
  const person = escuta.estudante.pessoaInstitucional;
  const canSchedule = escuta.status === "SOLICITADA";
  const canOpenQuestionnaire = escuta.status === "AGENDADA";
  const showPrimaryAction = canSchedule || canOpenQuestionnaire;
  const primaryLabel =
    escuta.status === "SOLICITADA"
      ? "Agendar Escuta"
      : "Realizar Escuta";

  const handlePrimaryAction = () => {
    if (canSchedule) {
      onSchedule(escuta);
      return;
    }

    if (canOpenQuestionnaire) {
      onOpenQuestionnaire(escuta);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { className: styles.detailsDrawer } }}
    >
      <section className={styles.detailsPanel} aria-label="Detalhes da escuta">
        <header className={styles.detailsHeader}>
          <div className={styles.detailsTitle}>
            <ChatOutlinedIcon />
            <h2>
              Atendimento de {getStudentName(escuta)}{" "}
              <span>(ID: {escuta.id.slice(0, 8)})</span>
            </h2>
          </div>
          <IconButton aria-label="Fechar detalhes" onClick={onClose}>
            <ArrowForwardOutlinedIcon />
          </IconButton>
        </header>

        <nav className={styles.detailsTabs} aria-label="Seções da escuta">
          <button
            type="button"
            className={activeTab === "gerais" ? styles.activeTab : ""}
            onClick={() => setActiveTab("gerais")}
          >
            Dados Gerais
          </button>
          <button
            type="button"
            className={activeTab === "paai" ? styles.activeTab : ""}
            onClick={() => setActiveTab("paai")}
          >
            PAAI
          </button>
          {escuta.status === "REALIZADA" ? (
            <button
              type="button"
              className={activeTab === "escuta" ? styles.activeTab : ""}
              onClick={() => setActiveTab("escuta")}
            >
              Escuta
            </button>
          ) : null}
        </nav>

        {activeTab === "gerais" ? (
          <>
            <section className={styles.scheduleSummary} aria-label="Resumo do agendamento">
              <DetailField label="Status" value={statusLabels[escuta.status]} />
              <DetailField label="Data" value={displaySchedule.date} />
              <DetailField label="Hora" value={displaySchedule.time || "-"} />
            </section>

            <section className={styles.statusSection} aria-label="Status do aluno">
              <strong>Status</strong>
              <div className={styles.studentStatus}>
                <Switch size="small" checked={escuta.estudante.ativo} disabled />
                <span>{escuta.estudante.ativo ? "Ativo" : "Inativo"}</span>
              </div>
            </section>

            <dl className={styles.detailGrid}>
              <DetailField label="Nome" value={getStudentName(escuta)} />
              <DetailField
                label="E-mail"
                value={escuta.emailPessoal ?? person.emailInstitucional}
              />
              <DetailField label="Curso" value={escuta.estudante.cursoAtual?.nome ?? "-"} />
              <DetailField
                label="Forma de ingresso"
                value={getQuestionnaireText(escuta, "forma_ingresso")}
              />
              <DetailField
                label="Matrícula"
                value={escuta.estudante.cursoAtual?.matricula ?? person.matricula}
              />
              <DetailField label="Modalidade" value={escuta.modalidadeCurso ?? "-"} />
              <DetailField label="Contato (Whatsapp)" value={escuta.telefoneWhatsapp ?? "-"} />
              <DetailField label="Oferta" value={escuta.ofertaCurso ?? "-"} />
            </dl>

            <section className={styles.disciplinesSection}>
              <div className={styles.sectionHeading}>
                <h3>Disciplinas</h3>
                <strong>Matriculado em {disciplineLinks.length} disciplinas</strong>
              </div>
              <div className={styles.disciplinesTable}>
                <Table
                  ariaLabel="Disciplinas da escuta"
                  columns={[
                    {
                      key: "disciplina",
                      header: "Nome",
                      render: (link) => link.turma.disciplina.nome,
                    },
                    {
                      key: "professor",
                      header: "Professor",
                      render: (link) => getProfessorNames(link),
                    },
                  ]}
                  data={disciplineLinks}
                  getRowKey={(link) => link.id}
                  isLoading={classGroupStudentsQuery.isLoading}
                  emptyMessage="Nenhuma disciplina vinculada ao aluno."
                  loadingMessage="Carregando disciplinas..."
                />
              </div>
            </section>
          </>
        ) : activeTab === "paai" ? (
          <PaaiPreviewPanel
            escuta={escuta}
            questionarioEscuta={questionarioEscuta}
            disciplineLinks={disciplineLinks}
          />
        ) : (
          <>
            <EscutaReadOnlyPanel escuta={escuta} questionarioEscuta={questionarioEscuta} />
            {false ? (
              <section className={styles.paaiPanel}>
            <dl className={styles.detailGrid}>
              <DetailField
                label="Tutor de apoio"
                value={
                  escuta?.temTutor === null
                    ? "-"
                    : escuta?.temTutor
                      ? "Sim"
                      : "Não"
                }
              />
              <DetailField label="Nome do tutor" value={escuta?.nomeTutor ?? "-"} />
              <DetailField label="Telefone do tutor" value={escuta?.telefoneTutor ?? "-"} />
              <DetailField
                label="Classificação do apoio"
                value={escuta?.classificacaoApoio ?? "-"}
              />
              <DetailField label="Necessita PAAI" value={escuta?.necessitaPaai ?? "-"} />
              <DetailField
                label="Encaminhamentos"
                value={escuta?.encaminhamentos.join(", ") || "-"}
              />
            </dl>
            <DetailField label="Resumo do caso" value={escuta?.resumoCaso ?? "-"} />
              </section>
            ) : null}
          </>
        )}

        <footer className={styles.detailsActions}>
          <Button variant="outlined" onClick={() => onExport(escuta)}>
            Exportar
          </Button>
          {showPrimaryAction ? (
            <Button variant="contained" onClick={handlePrimaryAction}>
              {primaryLabel}
            </Button>
          ) : null}
        </footer>
      </section>
    </Drawer>
  );
}

interface LegacyQuestionnaireDrawerProps {
  escuta: Escuta | null;
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: QuestionnaireValues) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyQuestionnaireDrawer({
  escuta,
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: LegacyQuestionnaireDrawerProps) {
  const [values, setValues] = useState<QuestionnaireValues>(
    escuta
      ? buildLegacyQuestionnaireInitialValues(escuta)
      : {
          temTutor: "SIM",
          nomeTutor: "",
          telefoneTutor: "",
          resumoCaso: "",
          classificacaoApoio: "Baixo",
          necessitaPaai: "Sim",
          encaminhamentos: ["Orientação Docente"],
          outrosEncaminhamentos: "",
        },
  );
  const canSubmit = values.resumoCaso.trim().length > 0;

  const updateValue = (field: keyof QuestionnaireValues, value: string | string[]) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleReferral = (referral: string, checked: boolean) => {
    setValues((current) => ({
      ...current,
      encaminhamentos: checked
        ? [...new Set([...current.encaminhamentos, referral])]
        : current.encaminhamentos.filter((item) => item !== referral),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { className: styles.drawer } }}
    >
      {escuta ? (
        <form className={styles.drawerPanel} onSubmit={handleSubmit}>
          <div className={styles.drawerHeader}>
            <AssignmentTurnedInOutlinedIcon />
            <h2>
              Atendimento de {getStudentName(escuta)}{" "}
              <span>(ID: {escuta.estudante.id.slice(0, 8)})</span>
            </h2>
          </div>

          <div className={styles.drawerTabs}>
            <span>Dados Gerais</span>
            <span>PAAI</span>
            <span className={styles.activeTab}>Escuta</span>
          </div>

          <section className={styles.questionSection}>
            <h3>Dados do Tutor</h3>
            <FormControl className={styles.radioGroup}>
              <span>Aluno tem tutor de apoio?</span>
              <RadioGroup
                row
                value={values.temTutor}
                onChange={(event) => updateValue("temTutor", event.target.value)}
              >
                <FormControlLabel value="SIM" control={<Radio />} label="Sim" />
                <FormControlLabel value="NAO" control={<Radio />} label="Não" />
              </RadioGroup>
            </FormControl>
            <div className={styles.formGrid}>
              <TextField
                label="Nome do tutor"
                value={values.nomeTutor}
                onChange={(event) => updateValue("nomeTutor", event.target.value)}
                size="small"
                disabled={values.temTutor === "NAO"}
              />
              <TextField
                label="Telefone do tutor"
                value={values.telefoneTutor}
                onChange={(event) => updateValue("telefoneTutor", event.target.value)}
                size="small"
                disabled={values.temTutor === "NAO"}
              />
            </div>
            <TextField
              label="Resumo do caso"
              value={values.resumoCaso}
              onChange={(event) => updateValue("resumoCaso", event.target.value)}
              multiline
              minRows={6}
              required
            />
          </section>

          <section className={styles.questionSection}>
            <FormControl className={styles.radioGroup}>
              <span>Classificação do nível de apoio</span>
              <RadioGroup
                row
                value={values.classificacaoApoio}
                onChange={(event) => updateValue("classificacaoApoio", event.target.value)}
              >
                <FormControlLabel value="Baixo" control={<Radio />} label="Baixo" />
                <FormControlLabel value="Moderado" control={<Radio />} label="Moderado" />
                <FormControlLabel value="Alto" control={<Radio />} label="Alto" />
              </RadioGroup>
            </FormControl>

            <FormControl className={styles.radioGroup}>
              <span>Necessita gerar PAAI?</span>
              <RadioGroup
                row
                value={values.necessitaPaai}
                onChange={(event) => updateValue("necessitaPaai", event.target.value)}
              >
                <FormControlLabel value="Sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="Não" control={<Radio />} label="Não" />
                <FormControlLabel value="Avaliar" control={<Radio />} label="Avaliar" />
              </RadioGroup>
            </FormControl>

            <div className={styles.checkboxGroup}>
              <span>Encaminhamentos</span>
              {["Orientação Docente", "Acompanhamento Contínuo", "Tutoria"].map((referral) => (
                <FormControlLabel
                  key={referral}
                  control={
                    <Checkbox
                      checked={values.encaminhamentos.includes(referral)}
                      onChange={(event) => toggleReferral(referral, event.target.checked)}
                    />
                  }
                  label={referral}
                />
              ))}
            </div>
            <TextField
              label="Outros"
              value={values.outrosEncaminhamentos}
              onChange={(event) => updateValue("outrosEncaminhamentos", event.target.value)}
              size="small"
            />
          </section>

          <div className={styles.drawerActions}>
            <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={!canSubmit || isSubmitting}>
              Finalizar
            </Button>
          </div>
        </form>
      ) : null}
    </Drawer>
  );
}

interface QuestionnaireDrawerProps {
  escuta: Escuta | null;
  questionarioEscuta: QuestionarioEscuta | null | undefined;
  open: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: FinishEscutaQuestionarioBodyApiDto) => Promise<void>;
}

function QuestionnaireDrawer({
  escuta,
  questionarioEscuta,
  open,
  isLoading,
  isSubmitting,
  onClose,
  onSubmit,
}: QuestionnaireDrawerProps) {
  const [values, setValues] = useState<RespostasQuestionarioEscuta>(() =>
    escuta && questionarioEscuta ? buildQuestionnaireInitialValues(escuta, questionarioEscuta) : {},
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!escuta) {
    return null;
  }

  const visibleQuestions = getAllQuestions(questionarioEscuta).filter((pergunta) =>
    matchesQuestionCondition(pergunta, values),
  );
  const canSubmit =
    Boolean(questionarioEscuta) &&
    visibleQuestions.every((pergunta) => {
      const answer = values[pergunta.id];

      if (pergunta.obrigatoria && !hasQuestionAnswer(answer)) {
        return false;
      }

      return !(
        pergunta.permiteOutro &&
        includesOther(answer) &&
        !hasQuestionAnswer(values[`${pergunta.id}_outro`])
      );
    });

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setValues((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const toggleMultipleAnswer = (questionId: string, value: string, checked: boolean) => {
    setValues((current) => {
      const answers = getArrayAnswer(current, questionId);

      return {
        ...current,
        [questionId]: checked
          ? [...new Set([...answers, value])]
          : answers.filter((answer) => answer !== value),
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!questionarioEscuta || !canSubmit || isSubmitting) {
      return;
    }

    await onSubmit({
      questionarioEscutaId: questionarioEscuta.id,
      questionarioEscutaVersao: questionarioEscuta.versao,
      respostasQuestionarioEscuta: values,
    });
    setConfirmOpen(false);
  };

  const renderQuestion = (pergunta: PerguntaQuestionario) => {
    const answer = values[pergunta.id];
    const otherVisible = pergunta.permiteOutro && includesOther(answer);

    if (pergunta.tipo === "selecao_unica") {
      return (
        <FormControl className={styles.dynamicQuestion} key={pergunta.id}>
          <span>
            {pergunta.titulo}
            {pergunta.obrigatoria ? " *" : ""}
          </span>
          <RadioGroup
            className={styles.questionOptions}
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => updateAnswer(pergunta.id, event.target.value)}
          >
            {(pergunta.opcoes ?? []).map((opcao) => (
              <FormControlLabel
                key={opcao.valor}
                value={opcao.valor}
                control={<Radio />}
                label={opcao.rotulo}
              />
            ))}
          </RadioGroup>
          {otherVisible ? (
            <TextField
              label="Detalhe a opção Outro"
              value={getStringAnswer(values, `${pergunta.id}_outro`)}
              onChange={(event) => updateAnswer(`${pergunta.id}_outro`, event.target.value)}
              size="small"
            />
          ) : null}
        </FormControl>
      );
    }

    if (pergunta.tipo === "selecao_multipla") {
      const answers = getArrayAnswer(values, pergunta.id);

      return (
        <FormControl className={styles.dynamicQuestion} key={pergunta.id}>
          <span>
            {pergunta.titulo}
            {pergunta.obrigatoria ? " *" : ""}
          </span>
          <div className={styles.questionOptions}>
            {(pergunta.opcoes ?? []).map((opcao) => (
              <FormControlLabel
                key={opcao.valor}
                control={
                  <Checkbox
                    checked={answers.includes(opcao.valor)}
                    onChange={(event) =>
                      toggleMultipleAnswer(pergunta.id, opcao.valor, event.target.checked)
                    }
                  />
                }
                label={opcao.rotulo}
              />
            ))}
          </div>
          {otherVisible ? (
            <TextField
              label="Detalhe a opção Outro"
              value={getStringAnswer(values, `${pergunta.id}_outro`)}
              onChange={(event) => updateAnswer(`${pergunta.id}_outro`, event.target.value)}
              size="small"
            />
          ) : null}
        </FormControl>
      );
    }

    return (
      <TextField
        key={pergunta.id}
        label={`${pergunta.titulo}${pergunta.obrigatoria ? " *" : ""}`}
        value={getStringAnswer(values, pergunta.id)}
        onChange={(event) => updateAnswer(pergunta.id, event.target.value)}
        type={pergunta.tipo === "data" ? "date" : "text"}
        multiline={pergunta.tipo === "texto_longo"}
        minRows={pergunta.tipo === "texto_longo" ? 5 : undefined}
        size={pergunta.tipo === "texto_longo" ? "medium" : "small"}
        slotProps={pergunta.tipo === "data" ? { inputLabel: { shrink: true } } : undefined}
      />
    );
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { className: styles.drawer } }}
      >
        <form className={styles.drawerPanel} onSubmit={handleSubmit}>
          <div className={styles.drawerHeader}>
            <AssignmentTurnedInOutlinedIcon />
            <h2>
              Atendimento de {getStudentName(escuta)}{" "}
              <span>(ID: {escuta.id.slice(0, 8)})</span>
            </h2>
          </div>

          <div className={styles.drawerTabs}>
            <span>Dados Gerais</span>
            <span>PAAI</span>
            <span className={styles.activeTab}>Escuta</span>
          </div>

          {isLoading || !questionarioEscuta ? (
            <p className={styles.loadingState}>Carregando questionário da escuta...</p>
          ) : (
            questionarioEscuta.secoes.map((secao) => {
              const questions = secao.perguntas.filter((pergunta) =>
                matchesQuestionCondition(pergunta, values),
              );

              if (!questions.length) {
                return null;
              }

              return (
                <section className={styles.questionSection} key={secao.id}>
                  <h3>{secao.titulo}</h3>
                  {questions.map(renderQuestion)}
                </section>
              );
            })
          )}

          <div className={styles.drawerActions}>
            <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={!canSubmit || isSubmitting}>
              Finalizar
            </Button>
          </div>
        </form>
      </Drawer>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className={styles.confirmTitle}>
          <AssignmentTurnedInOutlinedIcon />
          Atenção
        </DialogTitle>
        <DialogContent className={styles.confirmContent}>
          <p>
            Tem certeza que deseja finalizar a escuta do(a) aluno(a) {getStudentName(escuta)}?
          </p>
          <strong>Essa ação não pode ser desfeita.</strong>
        </DialogContent>
        <DialogActions className={styles.scheduleActions}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!canSubmit || isSubmitting}>
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function EscutasPage() {
  const session = useAuthSession();
  const unidadeAcademicaId = session?.payload.UnidadeAcademicaVinculada
    ? session.payload.UnidadeAcademicaId || undefined
    : undefined;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODAS");
  const [detailsEscuta, setDetailsEscuta] = useState<Escuta | null>(null);
  const [schedulingEscuta, setSchedulingEscuta] = useState<Escuta | null>(null);
  const [questionnaireEscuta, setQuestionnaireEscuta] = useState<Escuta | null>(null);
  const scheduleEscutaMutation = useScheduleEscuta();
  const finishQuestionnaireMutation = useFinishEscutaQuestionario();
  const questionarioEscutaQuery = useQuestionarioEscuta();
  const query = useMemo(
    () => ({
      page,
      pageSize,
      ...(statusFilter !== "TODAS" ? { status: statusFilter } : {}),
      ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      ...(unidadeAcademicaId ? { unidadeAcademicaId } : {}),
    }),
    [page, searchTerm, statusFilter, unidadeAcademicaId],
  );
  const escutasQuery = useEscutas(query);
  const escutas = escutasQuery.data?.data ?? [];
  const totalPages = Math.max(escutasQuery.data?.meta.totalPages ?? 1, 1);

  const columns = useMemo<TableColumn<Escuta>[]>(
    () => [
      {
        key: "id",
        header: "ID",
        width: "90px",
        render: (row) => row.id.slice(0, 8),
      },
      {
        key: "nome",
        header: "Nome",
        render: (row) => getStudentName(row),
      },
      {
        key: "email",
        header: "E-mail",
        render: (row) => row.estudante.pessoaInstitucional.emailInstitucional,
      },
      {
        key: "curso",
        header: "Curso",
        render: (row) => row.estudante.cursoAtual?.nome ?? "-",
      },
      {
        key: "matricula",
        header: "Matrícula",
        render: (row) =>
          row.estudante.cursoAtual?.matricula ?? row.estudante.pessoaInstitucional.matricula,
      },
      {
        key: "data",
        header: "Data",
        render: (row) => getDateTimeParts(row.agendadaPara).date,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span className={`${styles.statusBadge} ${styles[`status${row.status}`]}`}>
            {statusLabels[row.status]}
          </span>
        ),
      },
    ],
    [],
  );

  const handleStatusChange = (event: SelectChangeEvent) => {
    setPage(1);
    setStatusFilter(event.target.value as StatusFilter);
  };

  const handleSchedule = async (date: string, time: string) => {
    if (!schedulingEscuta) {
      return;
    }

    try {
      await scheduleEscutaMutation.mutateAsync({
        id: schedulingEscuta.id,
        agendadaPara: new Date(`${date}T${time}:00`).toISOString(),
      });
      toast.success("Escuta agendada com sucesso.");
      setSchedulingEscuta(null);
      setDetailsEscuta(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível agendar a escuta.");
    }
  };

  const handleFinishQuestionnaire = async (data: FinishEscutaQuestionarioBodyApiDto) => {
    if (!questionnaireEscuta) {
      return;
    }

    try {
      await finishQuestionnaireMutation.mutateAsync({
        id: questionnaireEscuta.id,
        data,
      });
      toast.success("Questionário da escuta finalizado.");
      setQuestionnaireEscuta(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível finalizar a escuta.",
      );
    }
  };

  const handleExport = () => {
    toast.info("ExportaÃ§Ã£o da escuta ainda nÃ£o implementada.");
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <TextField
            className={styles.searchField}
            label="Buscar aluno"
            onChange={(event) => {
              setPage(1);
              setSearchTerm(event.target.value);
            }}
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
          <FormControl className={styles.statusField} size="small">
            <InputLabel id="escuta-status-filter-label">Status</InputLabel>
            <Select
              labelId="escuta-status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <Table
        ariaLabel="Tabela de escutas"
        columns={columns}
        data={escutas}
        getRowKey={(row) => row.id}
        isLoading={escutasQuery.isLoading}
        emptyMessage="Nenhuma escuta encontrada."
        actions={(row) => (
          <div className={styles.rowActions}>
            <Tooltip title="Visualizar escuta">
              <IconButton color="primary" onClick={() => setDetailsEscuta(row)}>
                <VisibilityOutlinedIcon />
              </IconButton>
            </Tooltip>
            {row.status === "SOLICITADA" ? (
              <Tooltip title="Visualizar e agendar escuta">
                <IconButton color="primary" onClick={() => setDetailsEscuta(row)}>
                  <EventAvailableOutlinedIcon />
                </IconButton>
              </Tooltip>
            ) : null}
            <Tooltip title={row.status === "REALIZADA" ? "Ver questionário" : "Realizar escuta"}>
              <IconButton color="primary" onClick={() => setDetailsEscuta(row)}>
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>
        )}
      />

      <EscutaDetailsDrawer
        key={detailsEscuta?.id ?? "sem-detalhes"}
        open={Boolean(detailsEscuta)}
        escuta={detailsEscuta}
        questionarioEscuta={questionarioEscutaQuery.data}
        onClose={() => setDetailsEscuta(null)}
        onExport={handleExport}
        onOpenQuestionnaire={(escuta) => {
          setDetailsEscuta(null);
          setQuestionnaireEscuta(escuta);
        }}
        onSchedule={(escuta) => {
          setDetailsEscuta(null);
          setSchedulingEscuta(escuta);
        }}
      />

      <ScheduleDialog
        key={schedulingEscuta?.id ?? "sem-agendamento"}
        open={Boolean(schedulingEscuta)}
        escuta={schedulingEscuta}
        isSubmitting={scheduleEscutaMutation.isPending}
        onClose={() => setSchedulingEscuta(null)}
        onSubmit={handleSchedule}
      />

      <QuestionnaireDrawer
        key={`${questionnaireEscuta?.id ?? "sem-questionario"}-${
          questionarioEscutaQuery.data?.versao ?? "carregando"
        }`}
        open={Boolean(questionnaireEscuta)}
        escuta={questionnaireEscuta}
        questionarioEscuta={questionarioEscutaQuery.data}
        isLoading={questionarioEscutaQuery.isLoading}
        isSubmitting={finishQuestionnaireMutation.isPending}
        onClose={() => setQuestionnaireEscuta(null)}
        onSubmit={handleFinishQuestionnaire}
      />
    </div>
  );
}

export default EscutasPage;
