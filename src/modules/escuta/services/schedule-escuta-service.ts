import { api } from "@/shared/services/api";
import type { Escuta } from "../interfaces/escuta";

export interface ScheduleEscutaRequestApiDto {
  id: string;
  agendadaPara: string;
}

export type ScheduleEscutaResponseApiDto = Escuta;

export const scheduleEscutaApi = async ({
  id,
  agendadaPara,
}: ScheduleEscutaRequestApiDto) => {
  const response = await api.patch<ScheduleEscutaResponseApiDto>(
    `/api/v1/escutas/${id}/agendar`,
    { agendadaPara },
  );

  return response.data;
};
