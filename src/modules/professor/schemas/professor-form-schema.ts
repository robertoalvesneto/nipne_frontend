import { z } from "zod";

export const professorFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(150, "Nome deve ter no máximo 150 caracteres"),
  nomeSocial: z
    .string()
    .trim()
    .max(150, "Nome social deve ter no máximo 150 caracteres")
    .optional()
    .or(z.literal("")),
  emailInstitucional: z
    .string()
    .trim()
    .min(1, "E-mail institucional é obrigatório")
    .email("Informe um e-mail válido")
    .max(254, "E-mail deve ter no máximo 254 caracteres"),
  matricula: z
    .string()
    .trim()
    .min(1, "Matrícula é obrigatória")
    .max(50, "Matrícula deve ter no máximo 50 caracteres"),
  unidadesAcademicasIds: z
    .array(z.string().uuid("Unidade acadêmica inválida"))
    .min(1, "Selecione ao menos uma unidade acadêmica")
    .max(10, "Selecione no máximo 10 unidades acadêmicas"),
  ativo: z.boolean(),
});

export type ProfessorFormValues = z.infer<typeof professorFormSchema>;
