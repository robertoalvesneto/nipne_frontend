import { api } from "@/shared/services/api";

export interface UpdateClassGroupStatusResponseApiDto {
  success: boolean;
  ativo: boolean;
  message: string;
}

export const updateClassGroupStatusApi = async (
  id: string,
  ativo: boolean,
) => {
  const action = ativo ? "activate" : "deactivate";
  const response = await api.patch<UpdateClassGroupStatusResponseApiDto>(
    `/api/v1/class-groups/${id}/${action}`,
  );

  return response.data;
};
