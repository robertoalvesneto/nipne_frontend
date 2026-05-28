import type { Course } from "./course";

export interface Disciplina {
  id: string;
  nome: string;
  cargaHoraria: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  curso: Course;
}
