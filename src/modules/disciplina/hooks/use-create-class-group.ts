import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createClassGroupApi,
  type CreateClassGroupBodyApiDto,
  type CreateClassGroupResponseApiDto,
} from "../services/create-class-group-service";
import { CLASS_GROUPS_QUERY_KEY } from "./use-get-class-groups";

export const useCreateClassGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateClassGroupResponseApiDto,
    Error,
    CreateClassGroupBodyApiDto
  >({
    mutationFn: async (data) => {
      const response = await createClassGroupApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLASS_GROUPS_QUERY_KEY });
    },
  });
};
