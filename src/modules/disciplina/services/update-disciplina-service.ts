import { api } from "@/shared/services/api";
import type { Disciplina } from "../interfaces/disciplina";

export interface UpdateDisciplinaBodyApiDto {
  cursoId?: string;
  nome?: string;
  cargaHoraria?: number;
}

export type UpdateDisciplinaResponseApiDto = Disciplina;

export const updateDisciplinaApi = async (
  id: string,
  data: UpdateDisciplinaBodyApiDto,
) => {
  const response = await api.patch<UpdateDisciplinaResponseApiDto>(
    `/api/v1/disciplines/${id}`,
    data,
  );

  return response.data;
};
