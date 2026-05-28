import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfessorStatusApi,
  type UpdateProfessorStatusResponseApiDto,
} from "../services/update-professor-status-service";
import { PROFESSORS_QUERY_KEY } from "./use-get-professores";

export const useUpdateProfessorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfessorStatusResponseApiDto,
    Error,
    { id: string; ativo: boolean }
  >({
    mutationFn: async ({ id, ativo }) => {
      const response = await updateProfessorStatusApi(id, ativo);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROFESSORS_QUERY_KEY });
    },
  });
};
