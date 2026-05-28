import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDisciplinaApi,
  type CreateDisciplinaBodyApiDto,
  type CreateDisciplinaResponseApiDto,
} from "../services/create-disciplina-service";
import { DISCIPLINES_QUERY_KEY } from "./use-get-disciplinas";

export const useCreateDisciplina = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateDisciplinaResponseApiDto,
    Error,
    CreateDisciplinaBodyApiDto
  >({
    mutationFn: async (data) => {
      const response = await createDisciplinaApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DISCIPLINES_QUERY_KEY });
    },
  });
};
