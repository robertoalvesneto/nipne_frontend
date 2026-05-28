import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfessorApi,
  type UpdateProfessorBodyApiDto,
  type UpdateProfessorResponseApiDto,
} from "../services/update-professor-service";
import { PROFESSORS_QUERY_KEY } from "./use-get-professores";

export const useUpdateProfessor = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfessorResponseApiDto,
    Error,
    { id: string; data: UpdateProfessorBodyApiDto }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateProfessorApi(id, data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROFESSORS_QUERY_KEY });
    },
  });
};
