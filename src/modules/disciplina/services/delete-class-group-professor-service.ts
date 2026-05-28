import { api } from "@/shared/services/api";

export interface DeleteClassGroupProfessorResponseApiDto {
  success: boolean;
  message: string;
}

export const deleteClassGroupProfessorApi = async (id: string) => {
  const response = await api.delete<DeleteClassGroupProfessorResponseApiDto>(
    `/api/v1/class-group-professors/${id}`,
  );

  return response.data;
};
