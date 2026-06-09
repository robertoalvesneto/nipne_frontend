import { api } from "@/shared/services/api";
import type { QuestionarioCadastro } from "../interfaces/questionario-cadastro";

export type GetQuestionarioCadastroResponseApiDto = QuestionarioCadastro;

export const getQuestionarioCadastroApi = async () => {
  const response = await api.get<GetQuestionarioCadastroResponseApiDto>(
    "/api/v1/questionarios/cadastro-aluno",
  );

  return response.data;
};
