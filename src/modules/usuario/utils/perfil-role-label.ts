import { PerfilUsuario } from "../types/perfil-usuario";

export const roleLabelByPerfil: Record<PerfilUsuario, string> = {
  ALUNO: "Aluno",
  PROFESSOR: "Professor",
  COORDENADOR: "Coordenador",
  BOLSISTA: "Bolsista",
  GESTOR: "Reitor",
};
