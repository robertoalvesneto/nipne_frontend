import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateUsuarioApi,
  type UpdateUsuarioBodyApiDto,
  type UpdateUsuarioResponseApiDto,
} from "../services/update-usuario-service";
import { USERS_QUERY_KEY } from "./use-get-usuarios";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateUsuarioResponseApiDto,
    Error,
    { id: string; data: UpdateUsuarioBodyApiDto }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateUsuarioApi(id, data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
