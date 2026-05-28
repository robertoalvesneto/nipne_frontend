import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateDisciplinaStatusApi,
  type UpdateDisciplinaStatusResponseApiDto,
} from "../services/update-disciplina-status-service";
import { DISCIPLINES_QUERY_KEY } from "./use-get-disciplinas";

export const useUpdateDisciplinaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateDisciplinaStatusResponseApiDto,
    Error,
    { id: string; ativo: boolean }
  >({
    mutationFn: async ({ id, ativo }) => {
      const response = await updateDisciplinaStatusApi(id, ativo);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DISCIPLINES_QUERY_KEY });
    },
  });
};
