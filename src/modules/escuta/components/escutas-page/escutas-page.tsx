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
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
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
type DetailsTab = "gerais" | "escuta" | "paai";

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
  const answers = getArrayAnswer(respostas, key);
  const question = getAllQuestions(questionario).find((pergunta) => pergunta.id === key);
  const orderedAnswers = question?.opcoes?.length
    ? [
        ...question.opcoes.map((opcao) => opcao.valor).filter((value) => answers.includes(value)),
        ...answers.filter(
          (value) => !question.opcoes?.some((opcao) => opcao.valor === value),
        ),
      ]
    : answers;
  const labels = orderedAnswers
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
  value: ReactNode;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className={styles.detailField}>
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

function PaaiQuestionField({ label, value }: DetailFieldProps) {
  return (
    <div className={styles.paaiQuestion}>
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

type PaaiGuidanceItem = {
  texto: string;
};

type PreferenceQuestionConfig = {
  titulo: string;
  ids: string[];
  titleTerms: string[];
};

const paaiEvaluationGuidance: Record<string, string> = {
  tempo_insuficiente:
    "Concessão de tempo adicional: Garantir acréscimo de tempo para a realização de avaliações e a entrega de atividades em sala de aula. Verificar também a possibilidade de uma pausa para descanso cognitivo ou sensorial, quando necessário (em caso de desregulação).",
  formato_dissertativo:
    "Diversificação de formatos avaliativos para provas exclusivamente dissertativas: oferecer alternativas como avaliações orais, gravações (áudio ou vídeo), estudos de caso, atividades práticas, questões de múltipla escolha, entre outras.",
  avaliacoes_extensas:
    "Avaliações/atividades extensas, com elevado número de questões, que dificultam a concentração e o gerenciamento do tempo: reduzir a quantidade de questões dissertativas longas, bem como o número de questões na prova.",
  muitos_assuntos:
    "Fracionamento do conteúdo para avaliação: Dividir o conteúdo em avaliações menores ao longo do período, especialmente quando houver grande quantidade de temas, evitando concentrar vários assuntos em uma única avaliação e organizando as questões em sequência lógica.",
  formato_oral:
    "Diversificação de formatos avaliativos exclusivamente orais: Permitir que apresentações ou avaliações orais sejam substituídas por provas escritas, pesquisas ou mídias pré-gravadas.",
  enunciados_extensos:
    "Objetividade nos enunciados: elaborar questões com comandos claros, curtos e diretos, evitando textos excessivamente longos e organizando informações complexas em tópicos ou etapas.",
  trabalhos_grupo:
    "Flexibilidade nos agrupamentos: permitir que o estudante realize atividades individualmente, mesmo quando propostas em grupo, OU permitir que o aluno faça as atividades em trio, em vez de duplas (caso o aluno seja TEA e/ou TDAH).",
  prazos_curtos:
    "Extensão e flexibilização de prazos: conceder, no mínimo, uma semana para a realização de trabalhos/atividades extraclasse.",
  atividades_multietapas:
    "Adaptação da extensão das tarefas: Propor atividades mais concisas ou permitir entregas divididas em etapas menores em vez de um único formato extenso.",
  sem_ambiente_alternativo:
    "Flexibilização do ambiente: possibilitar a realização de provas e atividades em espaço alternativo à sala de aula, mais reservado, silencioso e com menor quantidade de estímulos, como o núcleo de inclusão ou um ambiente similar.",
  leitura_interpretacao:
    "Multimodalidade de recursos didáticos: Utilizar diferentes formatos para solicitar ao aluno o conhecimento (vídeos, mapas mentais, infográficos, demonstrações práticas), indo além da leitura e da interpretação exclusivas de textos acadêmicos.",
};

const paaiDidacticGuidance: Record<string, string> = {
  sarcasmo_ironias_metaforas:
    "Comunicação literal: Evitar o uso de sarcasmo, ironia, duplo sentido e metáforas, priorizando uma comunicação direta, objetiva e literal.",
  conceitos_sem_exemplos:
    "Instruções estruturadas e exemplificadas: fornecer instruções claras, organizadas e exemplificadas, associando os conteúdos teóricos a exemplos práticos e contextualizados.",
  aulas_expositivas:
    "Alternância metodológica: intercalar a exposição oral com outras estratégias pedagógicas, como atividades práticas ou resolução de problemas, evitando longos períodos de aula exclusivamente expositivos, de modo a favorecer a atenção, a participação e a aprendizagem.",
  sem_participacao_duvidas:
    "Incentivo à participação e ao esclarecimento de dúvidas: favorecer espaços e estratégias de mediação pedagógica que incentivem o(a) discente a fazer perguntas, solicitar esclarecimentos e manifestar dúvidas ou necessidades acadêmicas, de forma acolhedora e sem exposição desnecessária.",
  sem_interacao_pares: "Promoção de interações acadêmicas mediadas.",
  sem_mediacao_grupos:
    "Mediação na formação de grupos: orientar e acompanhar a organização de equipes para atividades coletivas, favorecendo a participação do(a) estudante e evitando situações de isolamento ou exclusão decorrentes da divisão espontânea dos grupos.",
  mudancas_cronograma:
    "Previsibilidade do cronograma: manter, sempre que possível, o planejamento previamente apresentado para aulas, atividades e avaliações. Quando alterações forem necessárias, comunicá-las com antecedência adequada, a fim de favorecer a organização acadêmica do(a) discente.",
  orientacoes_pouco_claras:
    "Orientações claras para atividades acadêmicas: fornecer instruções objetivas e organizadas sobre atividades, trabalhos e avaliações, preferencialmente também por escrito, incluindo etapas de realização, prazos, formatos esperados e critérios de avaliação.",
};

const paaiMaterialGuidance: Record<string, string> = {
  materiais_inacessiveis:
    "Acessibilidade dos materiais didáticos: disponibilizar materiais com organização clara, linguagem objetiva e formatos acessíveis, preferencialmente também em meio digital, utilizando estrutura legível e recursos que favoreçam a leitura, a compreensão e a utilização das informações.",
  sem_acesso_previo:
    "Disponibilização prévia de materiais: disponibilizar, sempre que possível, materiais de leitura, slides e conteúdo das aulas com antecedência adequada, favorecendo a preparação, a organização acadêmica e o acompanhamento das atividades pelo(a) discente.",
  sem_acesso_posterior:
    "Acesso a recursos de revisão das aulas: possibilitar, quando viável, o acesso posterior aos conteúdos apresentados em aula, por meio de gravações, resumos, anotações estruturadas ou outros materiais de apoio que favoreçam a revisão dos conteúdos e o acompanhamento acadêmico pelo(a) discente.",
};

const cadastroConditionLabels: Record<string, string> = {
  deficiencia_fisica: "Deficiência física",
  deficiencia_visual_cegueira: "Deficiência visual - cegueira",
  deficiencia_visual_baixa_visao: "Deficiência visual - baixa visão",
  pessoa_surda: "Pessoa surda",
  deficiencia_auditiva: "Pessoa com deficiência auditiva",
  deficiencias_multiplas: "Deficiências múltiplas",
  tea: "Transtorno do Espectro Autista (TEA)",
  tdah: "Transtorno do Déficit de Atenção e Hiperatividade (TDAH)",
  transtornos_aprendizagem:
    "Transtornos específicos da aprendizagem (Dislexia, Discalculia, Dislalia, Disgrafia)",
  altas_habilidades: "Altas habilidades ou superdotação",
};

const cadastroPreferenceLabels: Record<string, Record<string, string>> = {
  preferencias_tipos_aula: {
    aula_expositiva: "Aula expositiva;",
    aula_pratica: "Aula prática;",
    aula_dialogada: "Aula dialogada;",
    resolucao_exercicios: "Aula com resolução de exercícios;",
    exemplos_demonstracoes: "Aula baseada em exemplos e demonstrações;",
    estudos_casos: "Aula com estudo de caso/situações reais;",
    atividades_orientadas: "Aula com atividades orientadas durante a explicação.",
  },
  preferencias_forma_aprender: {
    fazendo_resumos: "Fazendo resumos;",
    resolvendo_exercicios: "Resolvendo exercícios;",
    assistindo_videoaulas: "Assistindo videoaulas;",
    estudando_sozinho: "Estudando sozinho;",
    estudando_com_colegas: "Estudando com colegas;",
    revisando_varias_vezes: "Revisando várias vezes;",
    explicando_para_outra_pessoa: "Explicando para outra pessoa;",
    atividades_praticas: "Realizando atividades práticas;",
    imagens_esquemas: "Fazendo uso de imagens/esquemas.",
  },
  preferencias_tipos_atividades: {
    escrita: "Escrita;",
    leitura: "Leitura;",
    apresentacao_oral: "Apresentação oral;",
    exercicios: "Exercícios;",
    atividades_praticas: "Atividades práticas;",
    trabalhos_individuais: "Trabalhos individuais.",
    trabalhos_grupo: "Trabalhos em grupo.",
  },
};

const cadastroAccessibilityLabels: Record<string, string> = {
  material_ampliado: "Necessidade de material ampliado;",
  leitor_tela: "Necessidade de compatibilidade com leitor de tela;",
  audiodescricao: "Necessidade de audiodescrição;",
  ledor: "Necessidade de ledor;",
  formatos_acessiveis: "Necessidade de formatos acessíveis de materiais acadêmicos.",
  interprete_libras: "Necessidade de intérprete de Libras",
  comunicacao_escrita: "Preferência por comunicação escrita",
  legendas: "Necessidade de legendas",
};

const cadastroSensoryLabels: Record<string, string> = {
  sensibilidade_estimulos: "Sensibilidade a sons, luzes ou ambientes muito estimulantes;",
  pausas_atividades: "Necessidade de pausas durante atividades acadêmicas;",
  mudancas_inesperadas: "Dificuldade com mudanças inesperadas;",
  previsibilidade_atividades: "Necessidade de maior previsibilidade nas atividades;",
  manter_foco: "Dificuldade em manter o foco;",
  cumprir_prazos: "Dificuldade em gerenciamento de prazos;",
  impulsividade: "Impulsividade;",
  interacao_social: "Dificuldades relacionadas à interação social no contexto acadêmico.",
};

const paaiInstitutionalParagraphs = [
  "O Núcleo de Inclusão reafirma seu compromisso em oferecer suporte ao(à) estudante e ao corpo docente no processo de promoção da acessibilidade acadêmica e pedagógica no contexto universitário. Nesse sentido, colocamo-nos à disposição para:",
  "Ressaltamos que a atuação colaborativa entre o NIPNE e os(as) docentes é fundamental para favorecer a participação, a aprendizagem, a permanência e o desenvolvimento acadêmico dos(as) estudantes com necessidades específicas.",
  "Por fim, destacamos que as ações desenvolvidas pelo NIPNE estão fundamentadas na Lei nº 12.764/2012, na Lei nº 13.146/2015, no Decreto nº 12.686/2025 e nos princípios da educação inclusiva e da acessibilidade no ensino superior.",
];

const paaiInstitutionalActions = [
  "Dialogar com os(as) docentes sobre estratégias pedagógicas mais acessíveis;",
  "Esclarecer dúvidas relacionadas às necessidades acadêmicas e às condições de acessibilidade do(a) estudante;",
  "Acompanhar a implementação das orientações apresentadas neste documento;",
  "Construir, de forma colaborativa, alternativas que respeitem a autonomia docente e os objetivos pedagógicos da disciplina.",
];

const preferenceQuestionConfigs: PreferenceQuestionConfig[] = [
  {
    titulo: "Tipos de aula",
    ids: ["preferencias_tipos_aula", "tipos_aula", "tipo_aula"],
    titleTerms: ["tipo", "aula"],
  },
  {
    titulo: "Forma de aprender",
    ids: ["preferencias_forma_aprender", "forma_aprender", "formas_aprender"],
    titleTerms: ["forma", "aprender"],
  },
  {
    titulo: "Tipos de atividades",
    ids: ["preferencias_tipos_atividades", "tipos_atividades", "tipo_atividade"],
    titleTerms: ["tipo", "atividade"],
  },
];

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getQuestionByNumberAndTerms(
  questionario: QuestionarioEscuta | null | undefined,
  numero: number,
  titleTerms: string[],
) {
  return getAllQuestions(questionario).find((pergunta) => {
    if (pergunta.numero !== numero) {
      return false;
    }

    const normalizedTitle = normalizeSearchText(pergunta.titulo);

    return titleTerms.every((term) => normalizedTitle.includes(normalizeSearchText(term)));
  });
}

function getQuestionTextAnswerByNumber(
  questionario: QuestionarioEscuta | null | undefined,
  respostas: RespostasQuestionarioEscuta | null | undefined,
  numero: number,
  titleTerms: string[],
) {
  if (!questionario) {
    return "";
  }

  const question = getQuestionByNumberAndTerms(questionario, numero, titleTerms);

  return question ? formatReadOnlyAnswer(questionario, question, respostas ?? {}) : "";
}

function getCadastroRawAnswer(escuta: Escuta, key: string) {
  return escuta.respostasQuestionarioCadastro?.[key];
}

function getCadastroStringAnswer(escuta: Escuta, key: string) {
  const value = getCadastroRawAnswer(escuta, key);

  return typeof value === "string" ? value.trim() : "";
}

function getCadastroArrayAnswer(escuta: Escuta, key: string) {
  const value = getCadastroRawAnswer(escuta, key);

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function getCadastroAnswerLabels(
  escuta: Escuta,
  key: string,
  labels: Record<string, string> = {},
) {
  const answers = getCadastroArrayAnswer(escuta, key).filter((item) => item !== "outro");
  const orderedAnswers = Object.keys(labels).length
    ? [
        ...Object.keys(labels).filter((item) => answers.includes(item)),
        ...answers.filter((item) => !labels[item]),
      ]
    : answers;
  const answerLabels = orderedAnswers.map((item) => labels[item] ?? item);
  const other = getCadastroStringAnswer(escuta, `${key}_outro`);

  return other ? [...answerLabels, other] : answerLabels;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function buildCadastroPreferenceSections(escuta: Escuta) {
  const configs = [
    { titulo: "2.1 Em relação aos tipos de aula", key: "preferencias_tipos_aula" },
    { titulo: "2.2 Em relação à forma de aprender", key: "preferencias_forma_aprender" },
    { titulo: "2.3 Em relação aos tipos de atividades", key: "preferencias_tipos_atividades" },
  ];

  return configs
    .map((config) => {
      const items = getCadastroAnswerLabels(
        escuta,
        config.key,
        cadastroPreferenceLabels[config.key],
      );

      return items.length ? { titulo: config.titulo, items } : null;
    })
    .filter((section): section is { titulo: string; items: string[] } => Boolean(section));
}

function buildAccessibilityNeeds(escuta: Escuta) {
  return uniqueStrings([
    ...getCadastroAnswerLabels(
      escuta,
      "detalhes_deficiencia_visual",
      cadastroAccessibilityLabels,
    ),
    ...getCadastroAnswerLabels(
      escuta,
      "detalhes_deficiencia_auditiva",
      cadastroAccessibilityLabels,
    ),
  ]);
}

function buildSensoryNeeds(escuta: Escuta) {
  return uniqueStrings([
    ...getCadastroAnswerLabels(escuta, "detalhes_tea", cadastroSensoryLabels),
    ...getCadastroAnswerLabels(escuta, "detalhes_tdah", cadastroSensoryLabels),
  ]);
}

function getEntradaCota(escuta: Escuta) {
  const explicitAnswer = getCadastroStringAnswer(escuta, "entrada_cota");

  if (explicitAnswer) {
    return explicitAnswer;
  }

  return getCadastroStringAnswer(escuta, "forma_ingresso") === "cota" ? "Sim" : "";
}

function buildPaaiGuidanceItems(
  respostas: RespostasQuestionarioEscuta | null | undefined,
  questionId: string,
  guidanceByValue: Record<string, string>,
  options?: {
    absenceValue?: string;
    absenceText?: string;
  },
): PaaiGuidanceItem[] {
  const answers = getArrayAnswer(respostas, questionId);

  if (options?.absenceValue && answers.includes(options.absenceValue)) {
    return [{ texto: options.absenceText ?? "Ausência de barreiras neste aspecto." }];
  }

  const selectedAnswers = new Set(answers.filter((answer) => answer !== "outro"));
  const items: PaaiGuidanceItem[] = Object.entries(guidanceByValue)
    .filter(([answer]) => selectedAnswers.has(answer))
    .map(([, texto]) => texto)
    .map((texto) => ({ texto }));
  const otherText = getStringAnswer(respostas, `${questionId}_outro`);

  if (answers.includes("outro") || otherText) {
    items.push({
      texto: otherText || "Campo para validação manual do NIPNE.",
    });
  }

  return items;
}

function findPreferenceQuestion(
  questionario: QuestionarioEscuta | null | undefined,
  config: PreferenceQuestionConfig,
) {
  return getAllQuestions(questionario).find((pergunta) => {
    if (config.ids.includes(pergunta.id)) {
      return true;
    }

    const normalizedTitle = normalizeSearchText(pergunta.titulo);

    return config.titleTerms.every((term) => normalizedTitle.includes(normalizeSearchText(term)));
  });
}

function buildPreferenceSections(
  questionario: QuestionarioEscuta | null | undefined,
  respostas: RespostasQuestionarioEscuta | null | undefined,
  escuta: Escuta,
) {
  const cadastroPreferences = buildCadastroPreferenceSections(escuta);

  if (cadastroPreferences.length) {
    return cadastroPreferences;
  }

  if (!questionario) {
    return [];
  }

  return preferenceQuestionConfigs
    .map((config) => {
      const question = findPreferenceQuestion(questionario, config);

      if (!question) {
        return null;
      }

      const items =
        question.tipo === "selecao_multipla"
          ? getAnswerLabels(questionario, respostas, question.id)
          : [formatReadOnlyAnswer(questionario, question, respostas ?? {})].filter(
              (value) => value && value !== "-",
            );

      return items.length ? { titulo: config.titulo, items } : null;
    })
    .filter((section): section is { titulo: string; items: string[] } => Boolean(section));
}

function renderGuidanceList(items: PaaiGuidanceItem[]) {
  if (!items.length) {
    return <p>-</p>;
  }

  return (
    <ul className={styles.paaiList}>
      {items.map((item) => (
        <li key={item.texto}>{item.texto}</li>
      ))}
    </ul>
  );
}

function renderPaaiValueList(items: string[]) {
  if (!items.length) {
    return "-";
  }

  return (
    <ul className={styles.paaiAnswerList}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function renderDisciplineSummary(disciplineLinks: ClassGroupStudent[]) {
  if (!disciplineLinks.length) {
    return "-";
  }

  return (
    <ul className={styles.paaiAnswerList}>
      {disciplineLinks.map((link) => (
        <li key={link.id}>
          {link.turma.disciplina.nome}
          <span>{link.turma.periodoLetivo.nome}</span>
        </li>
      ))}
    </ul>
  );
}

function renderProfessorSummary(disciplineLinks: ClassGroupStudent[]) {
  if (!disciplineLinks.length) {
    return "-";
  }

  return (
    <ul className={styles.paaiAnswerList}>
      {disciplineLinks.map((link) => (
        <li key={link.id}>
          {getProfessorNames(link)}
          <span>{link.turma.disciplina.nome}</span>
        </li>
      ))}
    </ul>
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
  const identificationName =
    getQuestionTextAnswerByNumber(questionarioEscuta, respostas, 1, ["nome"]) || studentName;
  const identificationRegistration =
    getQuestionTextAnswerByNumber(questionarioEscuta, respostas, 2, ["matricula"]) ||
    escuta.estudante.cursoAtual?.matricula ||
    person.matricula;
  const identificationCourse =
    getQuestionTextAnswerByNumber(questionarioEscuta, respostas, 3, ["curso"]) ||
    escuta.estudante.cursoAtual?.nome ||
    "";
  const periodo =
    getCadastroStringAnswer(escuta, "periodo") ||
    getCadastroStringAnswer(escuta, "periodo_atual") ||
    getCadastroStringAnswer(escuta, "periodo_curso");
  const diagnosticoItems = [
    ...getCadastroAnswerLabels(escuta, "condicoes", cadastroConditionLabels),
    getCadastroStringAnswer(escuta, "diagnostico"),
  ].filter(Boolean);
  const entradaCota = getEntradaCota(escuta);
  const preferenceSections = buildPreferenceSections(questionarioEscuta, respostas, escuta);
  const avaliacoes = buildPaaiGuidanceItems(
    respostas,
    "barreiras_avaliacoes",
    paaiEvaluationGuidance,
  );
  const didatica = buildPaaiGuidanceItems(
    respostas,
    "barreiras_didatica",
    paaiDidacticGuidance,
  );
  const materiais = buildPaaiGuidanceItems(
    respostas,
    "barreiras_materiais",
    paaiMaterialGuidance,
    {
      absenceValue: "nao_identifica",
      absenceText: "O aluno informou que não possui barreiras quanto a esse item",
    },
  );
  const impactAnswers = getArrayAnswer(respostas, "impacto_barreiras");
  const impactos = impactAnswers.includes("sem_impactos_relevantes")
    ? [getOptionLabel(questionarioEscuta, "impacto_barreiras", "sem_impactos_relevantes")]
    : getAnswerLabels(questionarioEscuta, respostas, "impacto_barreiras");
  const encaminhamentos = getAnswerLabels(questionarioEscuta, respostas, "encaminhamentos");
  const supportLevelAnswer = getAnswerLabel(questionarioEscuta, respostas, "classificacao_apoio");
  const supportLevel =
    supportLevelAnswer !== "-" ? supportLevelAnswer : escuta.classificacaoApoio || "-";
  const hasTutor = getStringAnswer(respostas, "tem_tutor") === "sim";
  const wantsTutor = getStringAnswer(respostas, "deseja_tutor") === "sim";
  const tutorName = getStringAnswer(respostas, "nome_tutor") || escuta.nomeTutor || "";
  const tutorPhone = getStringAnswer(respostas, "telefone_tutor") || escuta.telefoneTutor || "";
  const summary = getStringAnswer(respostas, "resumo_caso") || escuta.resumoCaso || "";
  const generatedReferrals = encaminhamentos.length ? encaminhamentos : escuta.encaminhamentos;
  const accessibilityNeeds = buildAccessibilityNeeds(escuta);
  const sensoryNeeds = buildSensoryNeeds(escuta);
  const escutaDate = formatDatePtBr(escuta.realizadaEm ?? escuta.agendadaPara ?? escuta.createdAt);
  const responsible = getStringAnswer(respostas, "responsavel_escuta");

  return (
    <section className={styles.paaiPanel} aria-label="Prévia do PAAI">
      <div className={styles.paaiHeader}>
        <h3>Plano de Acessibilidade Acadêmica Individual - PAAI</h3>
        <span>{getAnswerLabel(questionarioEscuta, respostas, "necessita_paai")}</span>
      </div>

      <div className={styles.paaiIntro}>
        <p>Prezado(a) Professor(a),</p>
        <p>
          Este documento tem como finalidade orientar os docentes quanto à adoção de estratégias de
          acessibilidade acadêmica, com base nas informações fornecidas pelo(a) estudante, em
          processo de escuta pedagógica conduzido pelo NIPNE-EST, visando favorecer sua
          participação, permanência e aprendizagem no contexto universitário.
        </p>
        <p>Seguem informações para conhecimento e providências:</p>
      </div>

      <section className={styles.paaiSection}>
        <h4>1. IDENTIFICAÇÃO DO(A) ALUNO(A)</h4>
        <p>Formulário de Identificação</p>
        <dl className={`${styles.paaiQuestionList} ${styles.paaiGridList}`}>
          <PaaiQuestionField label="Nome do Aluno(a)" value={identificationName} />
          <PaaiQuestionField label="Matrícula" value={identificationRegistration} />
          <PaaiQuestionField label="Curso" value={identificationCourse} />
          <PaaiQuestionField label="Período" value={periodo} />
          <PaaiQuestionField
            label="Unidade"
            value={
              escuta.estudante.unidadeAcademica.nome || escuta.estudante.unidadeAcademica.sigla
            }
          />
          <PaaiQuestionField label="Disciplina" value={renderDisciplineSummary(disciplineLinks)} />
          <PaaiQuestionField label="Professor(a)" value={renderProfessorSummary(disciplineLinks)} />
          <PaaiQuestionField
            label="Diagnóstico do aluno"
            value={renderPaaiValueList(diagnosticoItems)}
          />
          <PaaiQuestionField label="Entrada por Cota" value={entradaCota} />
        </dl>
      </section>

      {preferenceSections.length ? (
        <section className={styles.paaiSection}>
          <h4>2. IDENTIFICAÇÃO/LEVANTAMENTO DAS PREFERÊNCIAS DO(A) ESTUDANTE:</h4>
          <p>
            O(A) estudante apresenta as seguintes preferências e necessidades que facilitam seu
            processo de aprendizagem.
          </p>
          <dl className={styles.paaiQuestionList}>
            {preferenceSections.map((section) => (
              <PaaiQuestionField
                key={section.titulo}
                label={section.titulo}
                value={renderPaaiValueList(section.items)}
              />
            ))}
          </dl>
        </section>
      ) : null}

      <section className={styles.paaiSection}>
        <h4>3. ORIENTAÇÕES PARA ATENDER ÀS NECESSIDADES DIDÁTICO-PEDAGÓGICAS</h4>
        <p>
          Considerando a escuta realizada em {escutaDate || "-"} e visando promover condições de
          participação, aprendizagem e acessibilidade no contexto acadêmico, orienta-se a adoção das
          seguintes estratégias e condições de acessibilidade pedagógica, com foco na redução de
          barreiras que possam impactar o percurso educacional do(a) estudante:
        </p>
        <div className={styles.paaiQuestionList}>
          <div className={styles.paaiQuestion}>
            <dt>3.1 Em atividades avaliativas;</dt>
            <dd>{renderGuidanceList(avaliacoes)}</dd>
          </div>
          <div className={styles.paaiQuestion}>
            <dt>3.2 Em relação à didática e comunicação;</dt>
            <dd>{renderGuidanceList(didatica)}</dd>
          </div>
          <div className={styles.paaiQuestion}>
            <dt>3.3 Em relação ao acesso a tecnologias e materiais.</dt>
            <dd>{renderGuidanceList(materiais)}</dd>
          </div>
        </div>
      </section>

      <section className={styles.paaiSection}>
        <h4>4. NECESSIDADES COMPLEMENTARES DE ACESSIBILIDADE ACADÊMICA</h4>
        <dl className={styles.paaiQuestionList}>
          <PaaiQuestionField label="Classificação do nível de apoio" value={supportLevel} />
          {accessibilityNeeds.length ? (
            <PaaiQuestionField
              label="Recursos de acessibilidade e apoio à aprendizagem"
              value={renderPaaiValueList(accessibilityNeeds)}
            />
          ) : null}
          {sensoryNeeds.length ? (
            <PaaiQuestionField
              label="Aspectos sensoriais, organizacionais e de autorregulação"
              value={renderPaaiValueList(sensoryNeeds)}
            />
          ) : null}
          {hasTutor || wantsTutor ? (
            <div className={styles.paaiQuestion}>
              <dt>Tutoria</dt>
              <dd>
                {hasTutor ? (
                  <dl className={styles.paaiQuestionList}>
                    <PaaiQuestionField label="Nome do tutor" value={tutorName} />
                    <PaaiQuestionField label="Contato do tutor" value={tutorPhone} />
                  </dl>
                ) : (
                  renderPaaiValueList(["Tutoria"])
                )}
              </dd>
            </div>
          ) : null}
          <PaaiQuestionField
            label="Impactos das barreiras identificadas"
            value={renderPaaiValueList(impactos)}
          />
        </dl>
      </section>

      <section className={styles.paaiSection}>
        <h4>5. OBSERVAÇÕES DO NIPNE</h4>
        <div className={styles.paaiQuestionList}>
          <div className={styles.paaiQuestion}>
            <dt>Texto institucional padrão</dt>
            <dd>
              <div className={styles.paaiTextBlock}>
                <p>{paaiInstitutionalParagraphs[0]}</p>
                <ul className={styles.paaiAnswerList}>
                  {paaiInstitutionalActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
                <p>{paaiInstitutionalParagraphs[1]}</p>
                <p>{paaiInstitutionalParagraphs[2]}</p>
              </div>
            </dd>
          </div>
          <div className={styles.paaiQuestion}>
            <dt>Observações específicas do caso</dt>
            <dd>
              <TextField
                value={summary}
                multiline
                minRows={4}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            </dd>
          </div>
          <div className={styles.paaiQuestion}>
            <dt>Encaminhamentos</dt>
            <dd>
              <TextField
                value={generatedReferrals.join("\n")}
                multiline
                minRows={4}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            </dd>
          </div>
        </div>
      </section>

      <section className={styles.paaiSection}>
        <h4>5. VALIDADE E ACOMPANHAMENTO</h4>
        <dl className={`${styles.paaiQuestionList} ${styles.paaiGridList}`}>
          <PaaiQuestionField
            label="Validade"
            value="Este documento poderá ser revisto a qualquer momento, conforme necessidade identificada pelo(a) estudante, docentes ou NIPNE-EST."
          />
          <PaaiQuestionField label="Núcleo de Inclusão" value="EST/UEA" />
          <PaaiQuestionField label="Contato" value="nucleoinclusao.est@uea.edu.br" />
          <PaaiQuestionField
            label="Responsável pelo encaminhamento"
            value={responsible || "Profa. Áurea Hiléia da Silva Melo"}
          />
          <PaaiQuestionField label="Data da escuta" value={escutaDate} />
        </dl>
      </section>
    </section>
  );
}

interface EscutaReadOnlyPanelProps {
  escuta: Escuta;
  questionarioEscuta: QuestionarioEscuta | null | undefined;
  onEdit: () => void;
}

function EscutaReadOnlyPanel({ escuta, questionarioEscuta, onEdit }: EscutaReadOnlyPanelProps) {
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
      <div className={styles.readonlyActions}>
        <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
          Editar escuta
        </Button>
      </div>
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
  const canShowEscuta = escuta?.status === "REALIZADA";
  const canShowPaai =
    canShowEscuta &&
    getStringAnswer(escuta?.respostasQuestionarioEscuta, "necessita_paai") === "sim";
  const displayedTab: DetailsTab =
    activeTab === "paai"
      ? canShowPaai
        ? "paai"
        : canShowEscuta
          ? "escuta"
          : "gerais"
      : activeTab === "escuta" && canShowEscuta
        ? "escuta"
        : "gerais";

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
            className={displayedTab === "gerais" ? styles.activeTab : ""}
            onClick={() => setActiveTab("gerais")}
          >
            Dados Gerais
          </button>
          {canShowEscuta ? (
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
        ) : displayedTab === "escuta" && canShowEscuta ? (
          <>
            <EscutaReadOnlyPanel
              escuta={escuta}
              questionarioEscuta={questionarioEscuta}
              onEdit={() => onOpenQuestionnaire(escuta)}
            />
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
        ) : canShowPaai ? (
          <PaaiPreviewPanel
            escuta={escuta}
            questionarioEscuta={questionarioEscuta}
            disciplineLinks={disciplineLinks}
          />
        ) : (
          <section className={styles.readonlySection}>
            <p>Selecione uma seção disponível para visualizar a escuta.</p>
          </section>
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

  const isEditing = escuta.status === "REALIZADA";
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
      const noRelevantImpacts = "sem_impactos_relevantes";

      if (questionId === "impacto_barreiras" && value === noRelevantImpacts && checked) {
        return {
          ...current,
          [questionId]: [noRelevantImpacts],
        };
      }

      if (questionId === "impacto_barreiras" && value !== noRelevantImpacts && checked) {
        return {
          ...current,
          [questionId]: [...new Set([...answers.filter((answer) => answer !== noRelevantImpacts), value])],
        };
      }

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
              {isEditing ? "Editar escuta" : "Atendimento"} de {getStudentName(escuta)}{" "}
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
              {isEditing ? "Salvar alterações" : "Finalizar"}
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
            {isEditing
              ? `Tem certeza que deseja salvar as alterações da escuta do(a) aluno(a) ${getStudentName(escuta)}?`
              : `Tem certeza que deseja finalizar a escuta do(a) aluno(a) ${getStudentName(escuta)}?`}
          </p>
          <strong>
            {isEditing
              ? "As respostas serão atualizadas e refletidas no PAAI."
              : "Essa ação não pode ser desfeita."}
          </strong>
        </DialogContent>
        <DialogActions className={styles.scheduleActions}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!canSubmit || isSubmitting}>
            {isEditing ? "Salvar alterações" : "Finalizar"}
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

    const isEditing = questionnaireEscuta.status === "REALIZADA";

    try {
      await finishQuestionnaireMutation.mutateAsync({
        id: questionnaireEscuta.id,
        data,
      });
      toast.success(
        isEditing ? "Questionário da escuta atualizado." : "Questionário da escuta finalizado.",
      );
      setQuestionnaireEscuta(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Não foi possível atualizar a escuta."
            : "Não foi possível finalizar a escuta.",
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
            placeholder="Nome do aluno"
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
