import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateClassGroupStatusApi,
  type UpdateClassGroupStatusResponseApiDto,
} from "../services/update-class-group-status-service";
import { CLASS_GROUPS_QUERY_KEY } from "./use-get-class-groups";

export const useUpdateClassGroupStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateClassGroupStatusResponseApiDto,
    Error,
    { id: string; ativo: boolean }
  >({
    mutationFn: async ({ id, ativo }) => {
      const response = await updateClassGroupStatusApi(id, ativo);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLASS_GROUPS_QUERY_KEY });
    },
  });
};
