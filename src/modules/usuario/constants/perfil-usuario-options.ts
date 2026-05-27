import { roleLabelByPerfil } from "../utils/perfil-role-label";
import type { PerfilUsuario } from "../types/perfil-usuario";

export const perfilUsuarioValues = [
  "GESTOR",
  "COORDENADOR",
  "BOLSISTA",
  "ALUNO",
  "PROFESSOR",
] as const satisfies readonly PerfilUsuario[];

export const perfilUsuarioOptions = perfilUsuarioValues.map((value) => ({
  value,
  label: roleLabelByPerfil[value],
}));
