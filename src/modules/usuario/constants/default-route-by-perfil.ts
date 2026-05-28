import { PerfilUsuario } from "../types/perfil-usuario";

export const DefaultRouteByPerfil: Record<PerfilUsuario, string> = {
  GESTOR: "/auth/reitor/indicadores",
  COORDENADOR: "/auth/coordenador/alunos",
  BOLSISTA: "/auth/coordenador/alunos",
  ALUNO: "/auth/aluno/meus-dados",
  PROFESSOR: "/auth/professor/meus-alunos",
};
