import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateDisciplinaApi,
  type UpdateDisciplinaBodyApiDto,
  type UpdateDisciplinaResponseApiDto,
} from "../services/update-disciplina-service";
import { DISCIPLINES_QUERY_KEY } from "./use-get-disciplinas";

export const useUpdateDisciplina = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateDisciplinaResponseApiDto,
    Error,
    { id: string; data: UpdateDisciplinaBodyApiDto }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateDisciplinaApi(id, data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DISCIPLINES_QUERY_KEY });
    },
  });
};
