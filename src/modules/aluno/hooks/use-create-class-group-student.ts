import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLASS_GROUPS_QUERY_KEY } from "@/modules/disciplina/hooks/use-get-class-groups";
import {
  createClassGroupStudentApi,
  type CreateClassGroupStudentBodyApiDto,
  type CreateClassGroupStudentResponseApiDto,
} from "../services/create-class-group-student-service";
import { CLASS_GROUP_STUDENTS_QUERY_KEY } from "./use-get-class-group-students";
import { STUDENTS_QUERY_KEY } from "./use-get-students";

export const useCreateClassGroupStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateClassGroupStudentResponseApiDto,
    Error,
    CreateClassGroupStudentBodyApiDto
  >({
    mutationFn: async (data) => {
      const response = await createClassGroupStudentApi(data);
      return response;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CLASS_GROUP_STUDENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CLASS_GROUPS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY }),
      ]);
    },
  });
};
