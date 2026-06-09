import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEscutaApi,
  type CreateEscutaBodyApiDto,
  type CreateEscutaResponseApiDto,
} from "../services/create-escuta-service";
import { ESCUTAS_QUERY_KEY } from "./use-get-escutas";

export const useCreateEscuta = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateEscutaResponseApiDto, Error, CreateEscutaBodyApiDto>({
    mutationFn: async (data) => {
      const response = await createEscutaApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ESCUTAS_QUERY_KEY });
    },
  });
};
