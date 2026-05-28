import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createClassGroupProfessorApi,
  type CreateClassGroupProfessorBodyApiDto,
} from "../services/create-class-group-professor-service";
import { CLASS_GROUPS_QUERY_KEY } from "./use-get-class-groups";

export const useCreateClassGroupProfessor = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CreateClassGroupProfessorBodyApiDto>({
    mutationFn: async (data) => {
      const response = await createClassGroupProfessorApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLASS_GROUPS_QUERY_KEY });
    },
  });
};
