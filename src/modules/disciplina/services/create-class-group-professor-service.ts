import { api } from "@/shared/services/api";

export interface CreateClassGroupProfessorBodyApiDto {
  professorId: string;
  turmaId: string;
}

export const createClassGroupProfessorApi = async (
  data: CreateClassGroupProfessorBodyApiDto,
) => {
  const response = await api.post("/api/v1/class-group-professors", data);

  return response.data;
};
