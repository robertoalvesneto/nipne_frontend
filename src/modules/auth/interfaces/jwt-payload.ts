import type { PerfilUsuario } from "@/modules/usuario/types/perfil-usuario";

export type CategoriaUnidadeAcademica =
  | "ESCOLA_SUPERIOR"
  | "CENTRO_ESTUDOS_SUPERIORES"
  | "NUCLEO_ENSINO_SUPERIOR"
  | "OUTRA";

export interface JwtPayload {
  UnidadeAcademicaId: string;
  UnidadeAcademicaNome: string;
  UnidadeAcademicaSigla: string;
  UnidadeAcademicaCategoria: CategoriaUnidadeAcademica;
  nome: string;
  nomeSocial?: string | null;
  emailInstitucional: string;
  matricula: string;
  perfil: PerfilUsuario;
  exp?: number;
  iat?: number;
  sub?: string;
}
