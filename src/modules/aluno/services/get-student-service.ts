import { api } from "@/shared/services/api";
import type { Student } from "../interfaces/student";

export const getStudentApi = async (id: string) => {
  const response = await api.get<Student>(`/api/v1/students/${id}`);

  return response.data;
};
