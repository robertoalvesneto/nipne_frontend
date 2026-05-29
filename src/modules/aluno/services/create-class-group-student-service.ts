import { api } from "@/shared/services/api";
import type { ClassGroupStudent } from "../interfaces/class-group-student";

export interface CreateClassGroupStudentBodyApiDto {
  estudanteId: string;
  turmaId: string;
}

export type CreateClassGroupStudentResponseApiDto = ClassGroupStudent;

export const createClassGroupStudentApi = async (
  data: CreateClassGroupStudentBodyApiDto,
) => {
  const response = await api.post<CreateClassGroupStudentResponseApiDto>(
    "/api/v1/class-group-students",
    data,
  );

  return response.data;
};
