import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProfessorApi,
  type CreateProfessorBodyApiDto,
  type CreateProfessorResponseApiDto,
} from "../services/create-professor-service";
import { PROFESSORS_QUERY_KEY } from "./use-get-professores";

export const useCreateProfessor = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProfessorResponseApiDto,
    Error,
    CreateProfessorBodyApiDto
  >({
    mutationFn: async (data) => {
      const response = await createProfessorApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROFESSORS_QUERY_KEY });
    },
  });
};
