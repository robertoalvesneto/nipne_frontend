"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useMemo } from "react";
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
    register,
    reset,
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
    });
  });

  return (
    <form className={styles.form} onSubmit={submitForm}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <TextField
        label="Nome"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        fullWidth
        {...register("name")}
      />

      <TextField
        label="E-mail"
        type="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        fullWidth
        {...register("email")}
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

      <TextField
        label={mode === "create" ? "Senha" : "Nova senha"}
        type="password"
        autoComplete={mode === "create" ? "new-password" : "off"}
        error={Boolean(errors.password)}
        helperText={
          errors.password?.message ??
          (mode === "edit"
            ? "Deixe em branco para manter a senha atual."
            : undefined)
        }
        fullWidth
        {...register("password")}
      />

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
