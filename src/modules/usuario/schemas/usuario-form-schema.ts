import { z } from "zod";
import { perfilUsuarioValues } from "../constants/perfil-usuario-options";

const usuarioBaseFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(150, "Nome deve ter no máximo 150 caracteres"),
  email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  profile: z.enum(perfilUsuarioValues, {
    error: "Selecione um perfil",
  }),
});

export const createUsuarioFormSchema = usuarioBaseFormSchema.extend({
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const updateUsuarioFormSchema = usuarioBaseFormSchema.extend({
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UsuarioFormValues = z.infer<typeof updateUsuarioFormSchema>;
