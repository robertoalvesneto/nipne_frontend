"use client";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { Button, Drawer, type SelectChangeEvent } from "@mui/material";
import { useMemo, useState } from "react";
import { useClassGroups } from "@/modules/disciplina/hooks/use-get-class-groups";
import type { DisciplinaOferta } from "@/modules/disciplina/interfaces/disciplina-oferta";
import type { ClassGroupStudent } from "@/modules/aluno/interfaces/class-group-student";
import type { Course } from "@/modules/aluno/interfaces/course";
import { useQuestionarioCadastro } from "../../hooks/use-get-questionario-cadastro";
import type { RespostasQuestionarioCadastro } from "../../interfaces/questionario-cadastro";
import type { CadastroValues } from "./cadastro-escuta-types";
import { CadastroEscutaDadosStep } from "./cadastro-escuta-dados-step";
import {
  CadastroEscutaQuestionarioStep,
  isQuestionarioPreenchido,
} from "./cadastro-escuta-questionario-step";
import styles from "./meus-dados-page.module.css";

type CadastroStep = "dados" | "questionario";

function hasValue(value: string) {
  return value.trim().length > 0;
}

function buildCadastroAnswers(
  values: CadastroValues,
  selectedClassGroupIds: string[],
): RespostasQuestionarioCadastro {
  const preferredContact = {
    Whatsapp: "whatsapp",
    "E-mail": "email",
    Telefone: "telefone",
  }[values.formaPreferencialContato];
  const courseModality = {
    Licenciatura: "licenciatura",
    Bacharelado: "bacharelado",
    Tecnólogo: "tecnologico",
  }[values.modalidadeCurso];
  const courseOffer = {
    Regular: "regular",
    Especial: "especial",
  }[values.ofertaCurso];

  return {
    nome: values.nome,
    data_nascimento: values.dataNascimento,
    telefone_principal: values.telefoneWhatsapp,
    email_pessoal: values.emailPessoal,
    possui_outro_contato: hasValue(values.outroContato) ? "sim" : "nao",
    outro_contato: values.outroContato,
    forma_preferencial_contato: preferredContact ?? "",
    curso: values.cursoId,
    matricula_institucional: values.matricula,
    email_institucional: values.emailInstitucional,
    modalidade_curso: courseModality ?? "",
    oferta_curso: courseOffer ?? "",
    tipo_oferta_especial:
      values.ofertaCurso === "Especial" ? values.tipoOfertaEspecial : "",
    disciplinas_cursando: selectedClassGroupIds,
  };
}

interface CadastroEscutaDrawerProps {
  open: boolean;
  courses: Course[];
  initialValues: CadastroValues;
  initialSelectedClassGroupIds: string[];
  linkedClassGroups: ClassGroupStudent[];
  initialQuestionarioAnswers: RespostasQuestionarioCadastro;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    values: CadastroValues,
    selectedClassGroupIds: string[],
    questionarioCadastroId: string,
    questionarioCadastroVersao: string,
    respostasQuestionarioCadastro: RespostasQuestionarioCadastro,
  ) => Promise<void>;
}

export function CadastroEscutaDrawer({
  open,
  courses,
  initialValues,
  initialSelectedClassGroupIds,
  linkedClassGroups,
  initialQuestionarioAnswers,
  isSubmitting,
  onClose,
  onSubmit,
}: CadastroEscutaDrawerProps) {
  const [values, setValues] = useState<CadastroValues>(initialValues);
  const [step, setStep] = useState<CadastroStep>("dados");
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const [selectedClassGroupIds, setSelectedClassGroupIds] = useState<string[]>(
    initialSelectedClassGroupIds,
  );
  const [questionarioAnswers, setQuestionarioAnswers] =
    useState<RespostasQuestionarioCadastro>(initialQuestionarioAnswers);
  const questionarioQuery = useQuestionarioCadastro();
  const cadastroAnswers = buildCadastroAnswers(values, selectedClassGroupIds);
  const combinedAnswers = {
    ...questionarioAnswers,
    ...cadastroAnswers,
  };
  const canContinueToQuestionario =
    hasValue(values.nome) &&
    hasValue(values.dataNascimento) &&
    hasValue(values.telefoneWhatsapp) &&
    hasValue(values.emailPessoal) &&
    hasValue(values.matricula) &&
    hasValue(values.emailInstitucional) &&
    hasValue(values.cursoId) &&
    hasValue(values.modalidadeCurso) &&
    hasValue(values.ofertaCurso) &&
    (values.ofertaCurso !== "Especial" || hasValue(values.tipoOfertaEspecial)) &&
    selectedClassGroupIds.length > 0;
  const canFinishQuestionario = isQuestionarioPreenchido(
    questionarioQuery.data,
    combinedAnswers,
  );

  const classGroupsQuery = useClassGroups(
    {
      page: 1,
      pageSize: 100,
      ativo: true,
      sortBy: "disciplina",
      sortDirection: "asc",
      cursoId: values.cursoId,
    },
    open && Boolean(values.cursoId),
  );

  const classGroupById = useMemo(() => {
    const map = new Map<string, DisciplinaOferta>();

    linkedClassGroups.forEach((link) => {
      map.set(link.turma.id, link.turma);
    });
    classGroupsQuery.data?.data.forEach((classGroup) => {
      map.set(classGroup.id, classGroup);
    });

    return map;
  }, [classGroupsQuery.data?.data, linkedClassGroups]);

  const selectedClassGroups = selectedClassGroupIds
    .map((id) => classGroupById.get(id))
    .filter((classGroup): classGroup is DisciplinaOferta => Boolean(classGroup));

  const availableClassGroups = (classGroupsQuery.data?.data ?? []).filter(
    (classGroup) => !selectedClassGroupIds.includes(classGroup.id),
  );

  const isSelectedClassGroupAvailable = availableClassGroups.some(
    (classGroup) => classGroup.id === selectedClassGroupId,
  );

  const updateValue = (field: keyof CadastroValues, value: string | boolean) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCourseChange = (event: SelectChangeEvent) => {
    updateValue("cursoId", event.target.value);
    setSelectedClassGroupId("");
    setSelectedClassGroupIds([]);
  };

  const handleClassGroupChange = (event: SelectChangeEvent) => {
    setSelectedClassGroupId(event.target.value);
  };

  const handleAddClassGroup = () => {
    if (!isSelectedClassGroupAvailable) {
      return;
    }

    setSelectedClassGroupIds((current) => [...current, selectedClassGroupId]);
    setSelectedClassGroupId("");
  };

  const handleRemoveClassGroup = (classGroupId: string) => {
    setSelectedClassGroupIds((current) => current.filter((id) => id !== classGroupId));
  };

  const handleQuestionarioAnswerChange = (questionId: string, value: unknown) => {
    setQuestionarioAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (step === "dados") {
      if (!canContinueToQuestionario) {
        return;
      }

      setStep("questionario");
      return;
    }

    if (!canFinishQuestionario) {
      return;
    }

    if (!questionarioQuery.data) {
      return;
    }

    await onSubmit(
      values,
      selectedClassGroupIds,
      questionarioQuery.data.id,
      questionarioQuery.data.versao,
      combinedAnswers,
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { className: styles.drawer } }}
    >
      <form className={styles.drawerPanel} onSubmit={handleSubmit}>
        <div className={styles.drawerHeader}>
          <AssignmentTurnedInOutlinedIcon />
          <h2>Finalizar Cadastro</h2>
        </div>

        {step === "dados" ? (
          <CadastroEscutaDadosStep
            courses={courses}
            values={values}
            selectedClassGroupId={selectedClassGroupId}
            selectedClassGroups={selectedClassGroups}
            availableClassGroups={availableClassGroups}
            classGroupsLoading={classGroupsQuery.isLoading}
            questionario={questionarioQuery.data}
            isSelectedClassGroupAvailable={isSelectedClassGroupAvailable}
            onValueChange={updateValue}
            onCourseChange={handleCourseChange}
            onClassGroupChange={handleClassGroupChange}
            onAddClassGroup={handleAddClassGroup}
            onRemoveClassGroup={handleRemoveClassGroup}
          />
        ) : (
          <CadastroEscutaQuestionarioStep
            questionario={questionarioQuery.data}
            answers={combinedAnswers}
            isLoading={questionarioQuery.isLoading}
            errorMessage={questionarioQuery.error?.message}
            onAnswerChange={handleQuestionarioAnswerChange}
          />
        )}

        <div className={styles.drawerActions}>
          <Button
            variant="outlined"
            onClick={step === "questionario" ? () => setStep("dados") : onClose}
            disabled={isSubmitting}
          >
            {step === "questionario" ? "Voltar" : "Cancelar"}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              isSubmitting ||
              (step === "dados" ? !canContinueToQuestionario : !canFinishQuestionario)
            }
          >
            {step === "dados" ? "Continuar" : "Finalizar"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
