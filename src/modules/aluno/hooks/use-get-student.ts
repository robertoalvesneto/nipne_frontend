import { useQuery } from "@tanstack/react-query";
import { getStudentApi } from "../services/get-student-service";
import type { Student } from "../interfaces/student";

export const STUDENT_QUERY_KEY = ["student"] as const;
export const studentQueryKey = (id?: string) => ["student", id] as const;

export const useStudent = (id?: string) => {
  return useQuery<Student, Error>({
    queryKey: studentQueryKey(id),
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) {
        throw new Error("Informe o estudante.");
      }

      const response = await getStudentApi(id);
      return response;
    },
  });
};
