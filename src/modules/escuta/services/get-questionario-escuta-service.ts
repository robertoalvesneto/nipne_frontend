import { api } from "@/shared/services/api";
import type { QuestionarioEscuta } from "../interfaces/questionario-cadastro";

export type GetQuestionarioEscutaResponseApiDto = QuestionarioEscuta;

export const getQuestionarioEscutaApi = async () => {
  const response = await api.get<GetQuestionarioEscutaResponseApiDto>(
    "/api/v1/questionarios/escuta-nipne",
  );

  return response.data;
};
