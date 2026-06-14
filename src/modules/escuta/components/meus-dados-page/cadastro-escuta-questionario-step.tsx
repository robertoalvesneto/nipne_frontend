import {
  Alert,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { formatPhone } from "@/shared/utils/phone-mask";
import type {
  CondicaoPerguntaQuestionario,
  PerguntaQuestionario,
  QuestionarioCadastro,
  RespostasQuestionarioCadastro,
} from "../../interfaces/questionario-cadastro";
import styles from "./meus-dados-page.module.css";

function matchesCondition(
  condition: CondicaoPerguntaQuestionario,
  answer: unknown,
) {
  if (condition.operador === "igual") {
    return answer === condition.valor;
  }

  if (!Array.isArray(answer)) {
    return false;
  }

  if (condition.operador === "contem") {
    return answer.includes(condition.valor);
  }

  return (
    Array.isArray(condition.valor) &&
    condition.valor.some((value) => answer.includes(value))
  );
}

function hasAnswer(answer: unknown) {
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

function isPhoneQuestion(question: PerguntaQuestionario) {
  const text = `${question.id} ${question.titulo}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return text.includes("telefone") || text.includes("whatsapp");
}

export function isPerguntaVisible(
  pergunta: PerguntaQuestionario,
  answers: RespostasQuestionarioCadastro,
) {
  return pergunta.condicao
    ? matchesCondition(pergunta.condicao, answers[pergunta.condicao.perguntaId])
    : true;
}

export function isQuestionarioPreenchido(
  questionario: QuestionarioCadastro | undefined,
  answers: RespostasQuestionarioCadastro,
) {
  if (!questionario) {
    return false;
  }

  return questionario.secoes
    .flatMap((section) => section.perguntas)
    .filter((question) => question.origem === "questionario")
    .filter((question) => isPerguntaVisible(question, answers))
    .every(
      (question) =>
        (!question.obrigatoria || hasAnswer(answers[question.id])) &&
        (!question.permiteOutro ||
          !includesOther(answers[question.id]) ||
          hasAnswer(answers[`${question.id}_outro`])),
    );
}

interface CadastroEscutaQuestionarioStepProps {
  questionario?: QuestionarioCadastro;
  answers: RespostasQuestionarioCadastro;
  isLoading: boolean;
  errorMessage?: string;
  onAnswerChange: (questionId: string, value: unknown) => void;
}

export function CadastroEscutaQuestionarioStep({
  questionario,
  answers,
  isLoading,
  errorMessage,
  onAnswerChange,
}: CadastroEscutaQuestionarioStepProps) {
  if (isLoading) {
    return <p className={styles.loadingText}>Carregando questionário...</p>;
  }

  if (!questionario || errorMessage) {
    return (
      <Alert severity="error">
        {errorMessage ?? "Não foi possível carregar o questionário inicial."}
      </Alert>
    );
  }

  return (
    <div className={styles.questionario}>
      <div>
        <h3>{questionario.titulo}</h3>
        <p>Responda às perguntas abaixo para finalizar seu cadastro.</p>
      </div>

      {questionario.secoes.map((section) => {
        const questions = section.perguntas
          .filter((question) => question.origem === "questionario")
          .filter((question) => isPerguntaVisible(question, answers));

        if (!questions.length) {
          return null;
        }

        return (
          <section className={styles.questionarioSection} key={section.id}>
            <h4>
              {section.id} {section.titulo}
            </h4>
            {questions.map((question) => {
              const answer = answers[question.id];
              const otherField = question.permiteOutro && includesOther(answer) ? (
                <TextField
                  label="Outro"
                  value={String(answers[`${question.id}_outro`] ?? "")}
                  onChange={(event) =>
                    onAnswerChange(`${question.id}_outro`, event.target.value)
                  }
                  required
                  size="small"
                />
              ) : null;

              if (question.tipo === "selecao_unica") {
                return (
                  <FormControl className={styles.questionField} key={question.id}>
                    <FormLabel required={question.obrigatoria}>
                      {question.numero}. {question.titulo}
                    </FormLabel>
                    {question.ajuda ? (
                      <FormHelperText className={styles.questionHelp}>
                        {question.ajuda}
                      </FormHelperText>
                    ) : null}
                    <RadioGroup
                      value={typeof answer === "string" ? answer : ""}
                      onChange={(event) => onAnswerChange(question.id, event.target.value)}
                    >
                      {question.opcoes?.map((option) => (
                        <FormControlLabel
                          control={<Radio />}
                          key={option.valor}
                          label={option.rotulo}
                          value={option.valor}
                        />
                      ))}
                    </RadioGroup>
                    {otherField}
                  </FormControl>
                );
              }

              if (question.tipo === "selecao_multipla") {
                const selected = Array.isArray(answer) ? answer : [];

                return (
                  <FormControl className={styles.questionField} key={question.id}>
                    <FormLabel required={question.obrigatoria}>
                      {question.numero}. {question.titulo}
                    </FormLabel>
                    {question.ajuda ? (
                      <FormHelperText className={styles.questionHelp}>
                        {question.ajuda}
                      </FormHelperText>
                    ) : null}
                    <div className={styles.checkboxGroup}>
                      {question.opcoes?.map((option) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selected.includes(option.valor)}
                              onChange={(event) =>
                                onAnswerChange(
                                  question.id,
                                  event.target.checked
                                    ? [...selected, option.valor]
                                    : selected.filter((value) => value !== option.valor),
                                )
                              }
                            />
                          }
                          key={option.valor}
                          label={option.rotulo}
                        />
                      ))}
                    </div>
                    {otherField}
                  </FormControl>
                );
              }

              const isPhone = isPhoneQuestion(question);
              const textValue = typeof answer === "string" ? answer : "";

              return (
                <TextField
                  key={question.id}
                  label={`${question.numero}. ${question.titulo}`}
                  value={isPhone ? formatPhone(textValue) : textValue}
                  onChange={(event) =>
                    onAnswerChange(
                      question.id,
                      isPhone ? formatPhone(event.target.value) : event.target.value,
                    )
                  }
                  helperText={question.ajuda}
                  required={question.obrigatoria}
                  multiline={question.tipo === "texto_longo"}
                  minRows={question.tipo === "texto_longo" ? 4 : undefined}
                  placeholder={isPhone ? "(92) 99999-9999" : undefined}
                  slotProps={
                    isPhone
                      ? {
                          htmlInput: {
                            inputMode: "tel",
                            maxLength: 15,
                          },
                        }
                      : undefined
                  }
                />
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
