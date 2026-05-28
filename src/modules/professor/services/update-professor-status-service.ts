import { api } from "@/shared/services/api";

export interface UpdateProfessorStatusResponseApiDto {
  success: boolean;
  ativo: boolean;
  message: string;
}

export const updateProfessorStatusApi = async (id: string, ativo: boolean) => {
  const action = ativo ? "activate" : "deactivate";
  const response = await api.patch<UpdateProfessorStatusResponseApiDto>(
    `/api/v1/professors/${id}/${action}`,
  );

  return response.data;
};
