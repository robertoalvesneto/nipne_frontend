export type TipoPerguntaQuestionario =
  | "texto"
  | "texto_longo"
  | "data"
  | "selecao_unica"
  | "selecao_multipla"
  | "disciplinas";

export type OrigemRespostaQuestionario = "cadastro" | "questionario" | "disciplinas";

export interface OpcaoPerguntaQuestionario {
  valor: string;
  rotulo: string;
}

export interface CondicaoPerguntaQuestionario {
  perguntaId: string;
  operador: "igual" | "contem" | "contem_algum";
  valor: string | string[];
}

export interface PerguntaQuestionario {
  id: string;
  numero: number;
  titulo: string;
  tipo: TipoPerguntaQuestionario;
  origem: OrigemRespostaQuestionario;
  obrigatoria: boolean;
  opcoes?: OpcaoPerguntaQuestionario[];
  permiteOutro?: boolean;
  ajuda?: string;
  condicao?: CondicaoPerguntaQuestionario;
}

export interface SecaoQuestionario {
  id: string;
  titulo: string;
  perguntas: PerguntaQuestionario[];
}

export interface QuestionarioCadastro {
  id: string;
  versao: string;
  titulo: string;
  secoes: SecaoQuestionario[];
}

export type RespostasQuestionarioCadastro = Record<string, unknown>;
export type QuestionarioEscuta = QuestionarioCadastro;
export type RespostasQuestionarioEscuta = Record<string, unknown>;
