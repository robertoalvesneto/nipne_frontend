import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteClassGroupProfessorApi,
  type DeleteClassGroupProfessorResponseApiDto,
} from "../services/delete-class-group-professor-service";
import { CLASS_GROUPS_QUERY_KEY } from "./use-get-class-groups";

export const useDeleteClassGroupProfessor = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteClassGroupProfessorResponseApiDto, Error, string>({
    mutationFn: async (id) => {
      const response = await deleteClassGroupProfessorApi(id);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLASS_GROUPS_QUERY_KEY });
    },
  });
};
