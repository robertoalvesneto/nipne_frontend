import { api } from "@/shared/services/api";
import type { Escuta } from "../interfaces/escuta";

export interface CreateEscutaBodyApiDto {
  estudanteId: string;
  consentimento?: boolean;
}

export type CreateEscutaResponseApiDto = Escuta;

export const createEscutaApi = async (data: CreateEscutaBodyApiDto) => {
  const response = await api.post<CreateEscutaResponseApiDto>("/api/v1/escutas", data);

  return response.data;
};
