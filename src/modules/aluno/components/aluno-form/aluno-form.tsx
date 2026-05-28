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
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useCourses } from "../../hooks/use-get-courses";
import {
  alunoFormSchema,
  type AlunoFormValues,
} from "../../schemas/aluno-form-schema";
import styles from "./aluno-form.module.css";

export interface AlunoFormSubmitValues {
  nome: string;
  nomeSocial?: string;
  emailInstitucional: string;
  matricula: string;
  dataNascimento?: string;
  cursoId: string;
  telefone?: string;
  contatoApoioNome?: string;
  contatoApoioTelefone?: string;
  contatoApoioRelacao?: string;
}

export interface AlunoFormProps {
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
  contatoApoioNome: "",
  contatoApoioTelefone: "",
  contatoApoioRelacao: "",
};

export function AlunoForm({
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
    defaultValues,
  });
  const selectedCourseId = useWatch({ control, name: "cursoId" });

  useEffect(() => {
    reset(defaultValues);
  }, [reset]);

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      nome: values.nome.trim(),
      nomeSocial: values.nomeSocial?.trim() || undefined,
      emailInstitucional: values.emailInstitucional.trim(),
      matricula: values.matricula.trim(),
      dataNascimento: values.dataNascimento || undefined,
      cursoId: values.cursoId,
      telefone: values.telefone?.trim() || undefined,
      contatoApoioNome: values.contatoApoioNome?.trim() || undefined,
      contatoApoioTelefone: values.contatoApoioTelefone?.trim() || undefined,
      contatoApoioRelacao: values.contatoApoioRelacao?.trim() || undefined,
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
              {...field}
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
              {...field}
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
              {...field}
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
              {...field}
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
              {...field}
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
              {...field}
              error={Boolean(errors.telefone)}
              helperText={errors.telefone?.message}
              fullWidth
            />
          )}
        />
      </div>

      <section className={styles.section}>
        <strong>Contato de apoio</strong>
        <div className={styles.grid}>
          <Controller
            control={control}
            name="contatoApoioNome"
            render={({ field }) => (
              <TextField
                label="Nome"
                {...field}
                error={Boolean(errors.contatoApoioNome)}
                helperText={errors.contatoApoioNome?.message}
                fullWidth
              />
            )}
          />
          <Controller
            control={control}
            name="contatoApoioTelefone"
            render={({ field }) => (
              <TextField
                label="Telefone"
                {...field}
                error={Boolean(errors.contatoApoioTelefone)}
                helperText={errors.contatoApoioTelefone?.message}
                fullWidth
              />
            )}
          />
          <Controller
            control={control}
            name="contatoApoioRelacao"
            render={({ field }) => (
              <TextField
                label="Relação"
                {...field}
                error={Boolean(errors.contatoApoioRelacao)}
                helperText={errors.contatoApoioRelacao?.message}
                fullWidth
              />
            )}
          />
        </div>
      </section>

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
          {isSubmitting ? "Salvando..." : "Adicionar aluno"}
        </Button>
      </div>
    </form>
  );
}

export default AlunoForm;
