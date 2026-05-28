export type CategoriaUnidadeAcademica =
  | "ESCOLA_SUPERIOR"
  | "CENTRO_ESTUDOS_SUPERIORES"
  | "NUCLEO_ENSINO_SUPERIOR"
  | "OUTRA";

export interface AcademicUnit {
  id: string;
  nome: string;
  sigla: string;
  categoria: CategoriaUnidadeAcademica;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}
