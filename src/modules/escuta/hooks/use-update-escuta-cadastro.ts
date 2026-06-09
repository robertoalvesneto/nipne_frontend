import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEscutaCadastroApi,
  type UpdateEscutaCadastroRequestApiDto,
  type UpdateEscutaCadastroResponseApiDto,
} from "../services/update-escuta-cadastro-service";
import { ESCUTAS_QUERY_KEY } from "./use-get-escutas";

export const useUpdateEscutaCadastro = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateEscutaCadastroResponseApiDto,
    Error,
    UpdateEscutaCadastroRequestApiDto
  >({
    mutationFn: async (request) => {
      const response = await updateEscutaCadastroApi(request);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ESCUTAS_QUERY_KEY });
    },
  });
};
