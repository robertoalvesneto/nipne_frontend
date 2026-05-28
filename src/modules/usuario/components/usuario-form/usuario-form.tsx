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
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { perfilUsuarioOptions } from "../../constants/perfil-usuario-options";
import type { Usuario } from "../../interfaces/usuario";
import {
  createUsuarioFormSchema,
  updateUsuarioFormSchema,
  type UsuarioFormValues,
} from "../../schemas/usuario-form-schema";
import { getUsuarioPerfil } from "../../utils/get-usuario-perfil";
import styles from "./usuario-form.module.css";

export type UsuarioFormMode = "create" | "edit";

export interface UsuarioFormSubmitValues {
  name: string;
  email: string;
  profile: UsuarioFormValues["profile"];
  password?: string;
  ativo?: boolean;
}

export interface UsuarioFormProps {
  mode: UsuarioFormMode;
  usuario?: Usuario | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onSubmit: (values: UsuarioFormSubmitValues) => void | Promise<void>;
}

function getDefaultValues(
  mode: UsuarioFormMode,
  usuario?: Usuario | null,
): UsuarioFormValues {
  return {
    name: usuario?.name ?? "",
    email: usuario?.email ?? "",
    profile: getUsuarioPerfil(usuario ?? ({} as Usuario)) ?? "COORDENADOR",
    password: mode === "create" ? "" : "",
    ativo: usuario?.ativo !== false,
  };
}

export function UsuarioForm({
  mode,
  usuario,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: UsuarioFormProps) {
  const schema =
    mode === "create" ? createUsuarioFormSchema : updateUsuarioFormSchema;
  const defaultValues = useMemo(
    () => getDefaultValues(mode, usuario),
    [mode, usuario],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submitForm = handleSubmit(async (values) => {
    const password = values.password?.trim();

    await onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      profile: values.profile,
      password: password ? password : undefined,
      ativo: values.ativo,
    });
  });

  const syncNativeInputValue = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (
      target.name !== "name" &&
      target.name !== "email" &&
      target.name !== "password"
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
        name="name"
        render={({ field }) => (
          <TextField
            label="Nome"
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.value)}
            inputRef={field.ref}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            fullWidth
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="E-mail"
            type="email"
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.value)}
            inputRef={field.ref}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            fullWidth
          />
        )}
      />

      <Controller
        control={control}
        name="profile"
        render={({ field }) => (
          <FormControl fullWidth error={Boolean(errors.profile)}>
            <InputLabel id="usuario-profile-label">Perfil</InputLabel>
            <Select labelId="usuario-profile-label" label="Perfil" {...field}>
              {perfilUsuarioOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.profile?.message ? (
              <FormHelperText>{errors.profile.message}</FormHelperText>
            ) : null}
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label={mode === "create" ? "Senha" : "Nova senha"}
            type="password"
            name={field.name}
            value={field.value ?? ""}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.value)}
            inputRef={field.ref}
            autoComplete={mode === "create" ? "new-password" : "off"}
            error={Boolean(errors.password)}
            helperText={
              errors.password?.message ??
              (mode === "edit"
                ? "Deixe em branco para manter a senha atual."
                : undefined)
            }
            fullWidth
          />
        )}
      />

      {mode === "edit" ? (
        <Controller
          control={control}
          name="ativo"
          defaultValue={usuario?.ativo !== false}
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
              label={field.value ? "Usuário ativo" : "Usuário inativo"}
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
              ? "Adicionar usuário"
              : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

export default UsuarioForm;
