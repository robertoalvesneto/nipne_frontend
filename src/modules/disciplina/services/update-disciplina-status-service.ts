import { api } from "@/shared/services/api";

export interface UpdateDisciplinaStatusResponseApiDto {
  success: boolean;
  ativo: boolean;
  message: string;
}

export const updateDisciplinaStatusApi = async (id: string, ativo: boolean) => {
  const action = ativo ? "activate" : "deactivate";
  const response = await api.patch<UpdateDisciplinaStatusResponseApiDto>(
    `/api/v1/disciplines/${id}/${action}`,
  );

  return response.data;
};
