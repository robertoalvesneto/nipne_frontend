"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAcademicUnits } from "../../hooks/use-get-academic-units";
import type { AcademicUnit } from "../../interfaces/academic-unit";
import type { Professor } from "../../interfaces/professor";
import {
  professorFormSchema,
  type ProfessorFormValues,
} from "../../schemas/professor-form-schema";
import styles from "./professor-form.module.css";

export type ProfessorFormMode = "create" | "edit";

export interface ProfessorFormSubmitValues {
  nome: string;
  nomeSocial?: string;
  emailInstitucional: string;
  matricula: string;
  unidadesAcademicasIds: string[];
  ativo?: boolean;
}

export interface ProfessorFormProps {
  mode: ProfessorFormMode;
  professor?: Professor | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onSubmit: (values: ProfessorFormSubmitValues) => void | Promise<void>;
}

function getDefaultValues(
  professor?: Professor | null,
): ProfessorFormValues {
  return {
    nome: professor?.pessoaInstitucional.nome ?? "",
    nomeSocial: professor?.pessoaInstitucional.nomeSocial ?? "",
    emailInstitucional: professor?.pessoaInstitucional.emailInstitucional ?? "",
    matricula: professor?.pessoaInstitucional.matricula ?? "",
    unidadesAcademicasIds:
      professor?.unidadesAcademicas.map((unidade) => unidade.id) ?? [],
    ativo: professor?.ativo ?? true,
  };
}

function mergeAcademicUnitOptions(
  availableUnits: AcademicUnit[],
  professor?: Professor | null,
) {
  const unitById = new Map<string, AcademicUnit>();

  for (const unit of availableUnits) {
    unitById.set(unit.id, unit);
  }

  for (const unit of professor?.unidadesAcademicas ?? []) {
    unitById.set(unit.id, unit);
  }

  return Array.from(unitById.values());
}

export function ProfessorForm({
  mode,
  professor,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: ProfessorFormProps) {
  const academicUnitsQuery = useAcademicUnits();
  const defaultValues = useMemo(() => getDefaultValues(professor), [professor]);
  const academicUnitOptions = useMemo(
    () =>
      mergeAcademicUnitOptions(
        academicUnitsQuery.data?.data ?? [],
        professor,
      ),
    [academicUnitsQuery.data?.data, professor],
  );
  const academicUnitLabelById = useMemo(
    () =>
      new Map(
        academicUnitOptions.map((unit) => [
          unit.id,
          `${unit.sigla} - ${unit.nome}`,
        ]),
      ),
    [academicUnitOptions],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      nome: values.nome.trim(),
      nomeSocial: values.nomeSocial?.trim() ?? "",
      emailInstitucional: values.emailInstitucional.trim(),
      matricula: values.matricula.trim(),
      unidadesAcademicasIds: values.unidadesAcademicasIds,
      ativo: values.ativo,
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
      target.name !== "matricula"
    ) {
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
            label="E-mail institucional"
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
        name="unidadesAcademicasIds"
        render={({ field }) => (
          <FormControl fullWidth error={Boolean(errors.unidadesAcademicasIds)}>
            <InputLabel id="professor-unidades-label">
              Unidades acadêmicas
            </InputLabel>
            <Select
              labelId="professor-unidades-label"
              multiple
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => {
                const value = event.target.value;
                field.onChange(
                  typeof value === "string" ? value.split(",") : value,
                );
              }}
              input={<OutlinedInput label="Unidades acadêmicas" />}
              renderValue={(selected) =>
                selected
                  .map((id) => academicUnitLabelById.get(id) ?? id)
                  .join(", ")
              }
            >
              {academicUnitOptions.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  <Checkbox checked={field.value.includes(unit.id)} />
                  <ListItemText
                    primary={`${unit.sigla} - ${unit.nome}`}
                    secondary={unit.ativo ? undefined : "Unidade inativa"}
                  />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {errors.unidadesAcademicasIds?.message ??
                (academicUnitsQuery.isError
                  ? "Não foi possível carregar as unidades acadêmicas."
                  : undefined)}
            </FormHelperText>
          </FormControl>
        )}
      />

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
              label={field.value ? "Professor ativo" : "Professor inativo"}
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
              ? "Adicionar professor"
              : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

export default ProfessorForm;
