import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  finishEscutaQuestionarioApi,
  type FinishEscutaQuestionarioRequestApiDto,
  type FinishEscutaQuestionarioResponseApiDto,
} from "../services/finish-escuta-questionario-service";
import { ESCUTAS_QUERY_KEY } from "./use-get-escutas";

export const useFinishEscutaQuestionario = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FinishEscutaQuestionarioResponseApiDto,
    Error,
    FinishEscutaQuestionarioRequestApiDto
  >({
    mutationFn: async (request) => {
      const response = await finishEscutaQuestionarioApi(request);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ESCUTAS_QUERY_KEY });
    },
  });
};
