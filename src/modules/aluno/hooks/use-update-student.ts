import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateStudentApi,
  type UpdateStudentBodyApiDto,
  type UpdateStudentResponseApiDto,
} from "../services/update-student-service";
import { STUDENT_QUERY_KEY } from "./use-get-student";
import { STUDENTS_QUERY_KEY } from "./use-get-students";

export interface UpdateStudentMutationVariables {
  id: string;
  data: UpdateStudentBodyApiDto;
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateStudentResponseApiDto,
    Error,
    UpdateStudentMutationVariables
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateStudentApi(id, data);
      return response;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEY }),
      ]);
    },
  });
};
