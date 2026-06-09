import { api } from "@/shared/services/api";
import type { Escuta } from "../interfaces/escuta";
import type { CreateEscutaBodyApiDto } from "./create-escuta-service";

export type UpdateEscutaCadastroBodyApiDto = Partial<CreateEscutaBodyApiDto>;

export interface UpdateEscutaCadastroRequestApiDto {
  id: string;
  data: UpdateEscutaCadastroBodyApiDto;
}

export type UpdateEscutaCadastroResponseApiDto = Escuta;

export const updateEscutaCadastroApi = async ({
  id,
  data,
}: UpdateEscutaCadastroRequestApiDto) => {
  const response = await api.patch<UpdateEscutaCadastroResponseApiDto>(
    `/api/v1/escutas/${id}/cadastro`,
    data,
  );

  return response.data;
};
