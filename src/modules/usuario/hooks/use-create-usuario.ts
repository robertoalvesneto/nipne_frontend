import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUsuarioApi,
  CreateUsuarioBodyApiDto,
  CreateUsuarioResponseApiDto,
} from "../services/create-usuario-service";
import { USERS_QUERY_KEY } from "./use-get-usuarios";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateUsuarioResponseApiDto,
    Error,
    CreateUsuarioBodyApiDto
  >({
    mutationFn: async (data) => {
      const response = await createUsuarioApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
