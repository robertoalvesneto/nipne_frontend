import { api } from "@/shared/services/api";

export interface DeleteClassGroupStudentResponseApiDto {
  success: boolean;
  message: string;
}

export const deleteClassGroupStudentApi = async (id: string) => {
  const response = await api.delete<DeleteClassGroupStudentResponseApiDto>(
    `/api/v1/class-group-students/${id}`,
  );

  return response.data;
};
