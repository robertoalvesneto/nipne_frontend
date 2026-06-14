"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useCourses } from "../../hooks/use-get-courses";
import {
  alunoFormSchema,
  type AlunoFormValues,
} from "../../schemas/aluno-form-schema";
import { formatPhone } from "@/shared/utils/phone-mask";
import styles from "./aluno-form.module.css";

export interface AlunoFormSubmitValues {
  nome: string;
  nomeSocial?: string;
  emailInstitucional: string;
  matricula: string;
  dataNascimento?: string;
  cursoId: string;
  telefone?: string;
}

export type AlunoFormMode = "create" | "edit";
export type AlunoFormInitialValues = Partial<AlunoFormValues>;

export interface AlunoFormProps {
  mode?: AlunoFormMode;
  initialValues?: AlunoFormInitialValues;
  isSubmitting?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onSubmit: (values: AlunoFormSubmitValues) => void | Promise<void>;
}

const defaultValues: AlunoFormValues = {
  nome: "",
  nomeSocial: "",
  emailInstitucional: "",
  matricula: "",
  dataNascimento: "",
  cursoId: "",
  telefone: "",
};

function buildDefaultValues(initialValues?: AlunoFormInitialValues): AlunoFormValues {
  return {
    ...defaultValues,
    ...initialValues,
  };
}

export function AlunoForm({
  mode = "create",
  initialValues,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: AlunoFormProps) {
  const coursesQuery = useCourses();
  const courseOptions = useMemo(
    () => coursesQuery.data?.data ?? [],
    [coursesQuery.data?.data],
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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoFormSchema),
    defaultValues: buildDefaultValues(initialValues),
  });
  const selectedCourseId = useWatch({ control, name: "cursoId" });

  useEffect(() => {
    reset(buildDefaultValues(initialValues));
  }, [initialValues, reset]);

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      nome: values.nome.trim(),
      nomeSocial: values.nomeSocial?.trim() || undefined,
      emailInstitucional: values.emailInstitucional.trim(),
      matricula: values.matricula.trim(),
      dataNascimento: values.dataNascimento || undefined,
      cursoId: values.cursoId,
      telefone: values.telefone?.trim() || undefined,
    });
  });

  const syncNativeInputValue = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (
      target.name !== "nome" &&
      target.name !== "nomeSocial" &&
      target.name !== "emailInstitucional" &&
      target.name !== "matricula" &&
      target.name !== "dataNascimento" &&
      target.name !== "telefone"
    ) {
      return;
    }

    if (target.name === "telefone") {
      setValue("telefone", formatPhone(target.value), {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setValue(target.name, target.value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form
      className={styles.form}
      onInputCapture={syncNativeInputValue}
      onSubmit={submitForm}
    >
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
          name="nomeSocial"
          render={({ field }) => (
            <TextField
              label="Nome social"
              name={field.name}
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value)}
              inputRef={field.ref}
              error={Boolean(errors.nomeSocial)}
              helperText={errors.nomeSocial?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="emailInstitucional"
          render={({ field }) => (
            <TextField
              label="E-mail"
              type="email"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value)}
              inputRef={field.ref}
              error={Boolean(errors.emailInstitucional)}
              helperText={errors.emailInstitucional?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="matricula"
          render={({ field }) => (
            <TextField
              label="Matrícula"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value)}
              inputRef={field.ref}
              error={Boolean(errors.matricula)}
              helperText={errors.matricula?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="dataNascimento"
          render={({ field }) => (
            <TextField
              label="Data de nascimento"
              type="date"
              name={field.name}
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value)}
              inputRef={field.ref}
              error={Boolean(errors.dataNascimento)}
              helperText={errors.dataNascimento?.message}
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
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
              <InputLabel id="aluno-course-label">Curso</InputLabel>
              <Select
                labelId="aluno-course-label"
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
          name="telefone"
          render={({ field }) => (
            <TextField
              label="Contato (WhatsApp)"
              name={field.name}
              value={formatPhone(field.value ?? "")}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(formatPhone(event.target.value))}
              inputRef={field.ref}
              error={Boolean(errors.telefone)}
              helperText={errors.telefone?.message}
              fullWidth
              slotProps={{
                htmlInput: {
                  inputMode: "tel",
                  maxLength: 15,
                },
              }}
            />
          )}
        />
      </div>

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
            : mode === "edit"
              ? "Salvar alterações"
              : "Adicionar aluno"}
        </Button>
      </div>
    </form>
  );
}

export default AlunoForm;
