import type { PerfilUsuario } from "../types/perfil-usuario";

export const permissoesByPerfil: Record<PerfilUsuario, string[]> = {
  GESTOR: [
    "Alunos",
    "Escutas",
    "Ocorrências",
    "Disciplinas",
    "Usuários",
    "Configurações",
  ],
  COORDENADOR: ["Alunos", "Escutas", "Ocorrências", "Disciplinas", "Usuários"],
  BOLSISTA: ["Alunos", "Escutas", "Ocorrências", "Disciplinas"],
  ALUNO: ["Meus dados", "Minhas disciplinas", "Minhas ocorrências"],
  PROFESSOR: ["Meus alunos", "Minhas disciplinas", "Ocorrências"],
};
