import { useQuery } from "@tanstack/react-query";
import {
  getQuestionarioEscutaApi,
  type GetQuestionarioEscutaResponseApiDto,
} from "../services/get-questionario-escuta-service";

export const QUESTIONARIO_ESCUTA_QUERY_KEY = ["questionario-escuta-nipne"] as const;

export const useQuestionarioEscuta = (enabled = true) => {
  return useQuery<GetQuestionarioEscutaResponseApiDto, Error>({
    queryKey: QUESTIONARIO_ESCUTA_QUERY_KEY,
    queryFn: getQuestionarioEscutaApi,
    enabled,
  });
};
