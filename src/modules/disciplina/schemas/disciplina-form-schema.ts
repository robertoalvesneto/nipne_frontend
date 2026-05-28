import { z } from "zod";

export const disciplinaFormSchema = z.object({
  cursoId: z.string().uuid("Selecione um curso válido"),
  periodoLetivoId: z.string().uuid("Selecione um período letivo válido"),
  professorId: z.string().uuid("Selecione um professor válido"),
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(150, "Nome deve ter no máximo 150 caracteres"),
  codigo: z
    .string()
    .trim()
    .min(1, "Código é obrigatório")
    .max(30, "Código deve ter no máximo 30 caracteres"),
  cargaHoraria: z
    .number({
      error: "Carga horária é obrigatória",
    })
    .int("Carga horária deve ser um número inteiro")
    .min(1, "Carga horária deve ser maior que zero")
    .max(1000, "Carga horária deve ter no máximo 1000 horas"),
  ativo: z.boolean(),
});

export type DisciplinaFormValues = z.infer<typeof disciplinaFormSchema>;
