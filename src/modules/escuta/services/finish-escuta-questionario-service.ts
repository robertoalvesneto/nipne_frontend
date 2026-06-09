import { api } from "@/shared/services/api";
import type { Escuta } from "../interfaces/escuta";
import type { RespostasQuestionarioEscuta } from "../interfaces/questionario-cadastro";

export interface FinishEscutaQuestionarioBodyApiDto {
  questionarioEscutaId: string;
  questionarioEscutaVersao: string;
  respostasQuestionarioEscuta: RespostasQuestionarioEscuta;
  temTutor?: boolean;
  nomeTutor?: string;
  telefoneTutor?: string;
  resumoCaso?: string;
  classificacaoApoio?: string;
  necessitaPaai?: string;
  encaminhamentos?: string[];
  outrosEncaminhamentos?: string;
}

export interface FinishEscutaQuestionarioRequestApiDto {
  id: string;
  data: FinishEscutaQuestionarioBodyApiDto;
}

export type FinishEscutaQuestionarioResponseApiDto = Escuta;

export const finishEscutaQuestionarioApi = async ({
  id,
  data,
}: FinishEscutaQuestionarioRequestApiDto) => {
  const response = await api.patch<FinishEscutaQuestionarioResponseApiDto>(
    `/api/v1/escutas/${id}/questionario`,
    data,
  );

  return response.data;
};
