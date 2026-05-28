import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createStudentApi,
  type CreateStudentBodyApiDto,
  type CreateStudentResponseApiDto,
} from "../services/create-student-service";
import { STUDENTS_QUERY_KEY } from "./use-get-students";

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateStudentResponseApiDto,
    Error,
    CreateStudentBodyApiDto
  >({
    mutationFn: async (data) => {
      const response = await createStudentApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};
