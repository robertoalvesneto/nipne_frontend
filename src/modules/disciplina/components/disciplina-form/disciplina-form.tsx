"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useProfessores } from "@/modules/professor/hooks/use-get-professores";
import type { Professor } from "@/modules/professor/interfaces/professor";
import { useAcademicPeriods } from "../../hooks/use-get-academic-periods";
import { useCourses } from "../../hooks/use-get-courses";
import type { AcademicPeriod } from "../../interfaces/academic-period";
import type { Course } from "../../interfaces/course";
import type { DisciplinaOferta } from "../../interfaces/disciplina-oferta";
import {
  disciplinaFormSchema,
  type DisciplinaFormValues,
} from "../../schemas/disciplina-form-schema";
import styles from "./disciplina-form.module.css";

export type DisciplinaFormMode = "create" | "edit";

export interface DisciplinaFormSubmitValues {
  cursoId: string;
  periodoLetivoId: string;
  professorId: string;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  ativo?: boolean;
}

export interface DisciplinaFormProps {
  mode: DisciplinaFormMode;
  disciplina?: DisciplinaOferta | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onSubmit: (values: DisciplinaFormSubmitValues) => void | Promise<void>;
}

function getDefaultValues(
  disciplina?: DisciplinaOferta | null,
): DisciplinaFormValues {
  return {
    cursoId: disciplina?.disciplina.curso.id ?? "",
    periodoLetivoId: disciplina?.periodoLetivo.id ?? "",
    professorId: disciplina?.professores[0]?.id ?? "",
    nome: disciplina?.disciplina.nome ?? "",
    codigo: disciplina?.sigla ?? "",
    cargaHoraria: disciplina?.disciplina.cargaHoraria ?? 60,
    ativo: disciplina?.ativo ?? true,
  };
}

function mergeCourseOptions(
  availableCourses: Course[],
  disciplina?: DisciplinaOferta | null,
) {
  const courseById = new Map<string, Course>();

  for (const course of availableCourses) {
    courseById.set(course.id, course);
  }

  if (disciplina?.disciplina.curso) {
    courseById.set(
      disciplina.disciplina.curso.id,
      disciplina.disciplina.curso,
    );
  }

  return Array.from(courseById.values());
}

function mergePeriodOptions(
  availablePeriods: AcademicPeriod[],
  disciplina?: DisciplinaOferta | null,
) {
  const periodById = new Map<string, AcademicPeriod>();

  for (const period of availablePeriods) {
    periodById.set(period.id, period);
  }

  if (disciplina?.periodoLetivo) {
    periodById.set(disciplina.periodoLetivo.id, disciplina.periodoLetivo);
  }

  return Array.from(periodById.values());
}

function mergeProfessorOptions(
  availableProfessors: Professor[],
  disciplina?: DisciplinaOferta | null,
) {
  const professorById = new Map<string, Professor>();

  for (const professor of availableProfessors) {
    professorById.set(professor.id, professor);
  }

  for (const professor of disciplina?.professores ?? []) {
    professorById.set(professor.id, {
      id: professor.id,
      ativo: professor.ativo,
      pessoaInstitucional: professor.pessoaInstitucional,
      createdAt: professor.pessoaInstitucional.createdAt,
      updatedAt: professor.pessoaInstitucional.updatedAt,
      unidadesAcademicas: [],
    });
  }

  return Array.from(professorById.values());
}

function getProfessorNome(professor: Professor) {
  return (
    professor.pessoaInstitucional.nomeSocial?.trim() ||
    professor.pessoaInstitucional.nome
  );
}

export function DisciplinaForm({
  mode,
  disciplina,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: DisciplinaFormProps) {
  const coursesQuery = useCourses();
  const periodsQuery = useAcademicPeriods({ ativo: true });
  const professorsQuery = useProfessores({
    page: 1,
    pageSize: 100,
    ativo: true,
    sortBy: "nome",
    sortDirection: "asc",
  });
  const defaultValues = useMemo(
    () => getDefaultValues(disciplina),
    [disciplina],
  );
  const courseOptions = useMemo(
    () => mergeCourseOptions(coursesQuery.data?.data ?? [], disciplina),
    [coursesQuery.data?.data, disciplina],
  );
  const periodOptions = useMemo(
    () => mergePeriodOptions(periodsQuery.data?.data ?? [], disciplina),
    [periodsQuery.data?.data, disciplina],
  );
  const professorOptions = useMemo(
    () => mergeProfessorOptions(professorsQuery.data?.data ?? [], disciplina),
    [professorsQuery.data?.data, disciplina],
  );
  const courseLabelById = useMemo(
    () =>
      new Map(
        courseOptions.map((course) => [
          course.id,
          `${course.sigla} - ${course.nome}`,
        ]),
      ),
    [courseOptions],
  );
  const periodLabelById = useMemo(
    () =>
      new Map(
        periodOptions.map((period) => [
          period.id,
          `${period.nome} - ${period.nome}`,
        ]),
      ),
    [periodOptions],
  );
  const professorLabelById = useMemo(
    () =>
      new Map(
        professorOptions.map((professor) => [
          professor.id,
          getProfessorNome(professor),
        ]),
      ),
    [professorOptions],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DisciplinaFormValues>({
    resolver: zodResolver(disciplinaFormSchema),
    defaultValues,
  });
  const selectedCourseId = useWatch({ control, name: "cursoId" });
  const selectedPeriodId = useWatch({ control, name: "periodoLetivoId" });
  const selectedProfessorId = useWatch({ control, name: "professorId" });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      cursoId: values.cursoId,
      periodoLetivoId: values.periodoLetivoId,
      professorId: values.professorId,
      nome: values.nome.trim(),
      codigo: values.codigo.trim().toUpperCase(),
      cargaHoraria: values.cargaHoraria,
      ativo: values.ativo,
    });
  });

  return (
    <form className={styles.form} onSubmit={submitForm}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <div className={styles.grid}>
        <Controller
          control={control}
          name="nome"
          render={({ field }) => (
            <TextField
              label="Nome"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value)}
              inputRef={field.ref}
              error={Boolean(errors.nome)}
              helperText={errors.nome?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="codigo"
          render={({ field }) => (
            <TextField
              label="Código"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value)}
              inputRef={field.ref}
              error={Boolean(errors.codigo)}
              helperText={errors.codigo?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="cargaHoraria"
          render={({ field }) => (
            <TextField
              label="Carga horária"
              type="number"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(Number(event.target.value))}
              inputRef={field.ref}
              error={Boolean(errors.cargaHoraria)}
              helperText={errors.cargaHoraria?.message}
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 1000,
                },
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="cursoId"
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.cursoId)}>
              <InputLabel id="disciplina-course-label">Curso</InputLabel>
              <Select
                labelId="disciplina-course-label"
                label="Curso"
                name={field.name}
                value={selectedCourseId ?? ""}
                onBlur={field.onBlur}
                onChange={(event) =>
                  setValue("cursoId", String(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                inputRef={field.ref}
                input={<OutlinedInput label="Curso" />}
                renderValue={(selected) =>
                  selected ? (courseLabelById.get(selected) ?? selected) : ""
                }
              >
                <MenuItem value="" disabled>
                  Selecione um curso
                </MenuItem>
                {courseOptions.map((course) => (
                  <MenuItem
                    key={course.id}
                    value={course.id}
                    onClick={() =>
                      setValue("cursoId", course.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    {course.sigla} - {course.nome}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.cursoId?.message ??
                  (coursesQuery.isError
                    ? "Não foi possível carregar os cursos."
                    : undefined)}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="periodoLetivoId"
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.periodoLetivoId)}>
              <InputLabel id="disciplina-period-label">
                Período letivo
              </InputLabel>
              <Select
                labelId="disciplina-period-label"
                label="Período letivo"
                name={field.name}
                value={selectedPeriodId ?? ""}
                onBlur={field.onBlur}
                onChange={(event) =>
                  setValue("periodoLetivoId", String(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                inputRef={field.ref}
                input={<OutlinedInput label="Período letivo" />}
                renderValue={(selected) =>
                  selected ? (periodLabelById.get(selected) ?? selected) : ""
                }
              >
                <MenuItem value="" disabled>
                  Selecione um período
                </MenuItem>
                {periodOptions.map((period) => (
                  <MenuItem
                    key={period.id}
                    value={period.id}
                    onClick={() =>
                      setValue("periodoLetivoId", period.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    {period.nome}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.periodoLetivoId?.message ??
                  (periodsQuery.isError
                    ? "Não foi possível carregar os períodos."
                    : undefined)}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="professorId"
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.professorId)}>
              <InputLabel id="disciplina-professor-label">Professor</InputLabel>
              <Select
                labelId="disciplina-professor-label"
                label="Professor"
                name={field.name}
                value={selectedProfessorId ?? ""}
                onBlur={field.onBlur}
                onChange={(event) =>
                  setValue("professorId", String(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                inputRef={field.ref}
                input={<OutlinedInput label="Professor" />}
                renderValue={(selected) =>
                  selected
                    ? (professorLabelById.get(selected) ?? selected)
                    : ""
                }
              >
                <MenuItem value="" disabled>
                  Selecione um professor
                </MenuItem>
                {professorOptions.map((professor) => (
                  <MenuItem
                    key={professor.id}
                    value={professor.id}
                    onClick={() =>
                      setValue("professorId", professor.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    {getProfessorNome(professor)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.professorId?.message ??
                  (professorsQuery.isError
                    ? "Não foi possível carregar os professores."
                    : undefined)}
              </FormHelperText>
            </FormControl>
          )}
        />
      </div>

      {mode === "edit" ? (
        <Controller
          control={control}
          name="ativo"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(field.value)}
                  color="success"
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
              }
              label={field.value ? "Oferta ativa" : "Oferta inativa"}
            />
          )}
        />
      ) : null}

      <div className={styles.actions}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Adicionar disciplina"
              : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

export default DisciplinaForm;
