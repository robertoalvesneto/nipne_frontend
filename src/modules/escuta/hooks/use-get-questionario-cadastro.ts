import { useQuery } from "@tanstack/react-query";
import {
  getQuestionarioCadastroApi,
  type GetQuestionarioCadastroResponseApiDto,
} from "../services/get-questionario-cadastro-service";

export const QUESTIONARIO_CADASTRO_QUERY_KEY = ["questionario-cadastro-aluno"] as const;

export const useQuestionarioCadastro = () => {
  return useQuery<GetQuestionarioCadastroResponseApiDto, Error>({
    queryKey: QUESTIONARIO_CADASTRO_QUERY_KEY,
    queryFn: getQuestionarioCadastroApi,
  });
};
