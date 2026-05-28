import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateClassGroupApi,
  type UpdateClassGroupBodyApiDto,
  type UpdateClassGroupResponseApiDto,
} from "../services/update-class-group-service";
import { CLASS_GROUPS_QUERY_KEY } from "./use-get-class-groups";

export const useUpdateClassGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateClassGroupResponseApiDto,
    Error,
    { id: string; data: UpdateClassGroupBodyApiDto }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateClassGroupApi(id, data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLASS_GROUPS_QUERY_KEY });
    },
  });
};
