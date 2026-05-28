import { z } from "zod";

export const alunoFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(150, "Nome deve ter no máximo 150 caracteres"),
  nomeSocial: z.string().trim().max(150).optional(),
  emailInstitucional: z
    .string()
    .trim()
    .email("Informe um e-mail válido")
    .max(254, "E-mail deve ter no máximo 254 caracteres"),
  matricula: z
    .string()
    .trim()
    .min(1, "Matrícula é obrigatória")
    .max(50, "Matrícula deve ter no máximo 50 caracteres"),
  dataNascimento: z.string().optional(),
  cursoId: z.string().uuid("Selecione um curso válido"),
  telefone: z.string().trim().max(20).optional(),
  contatoApoioNome: z.string().trim().max(150).optional(),
  contatoApoioTelefone: z.string().trim().max(20).optional(),
  contatoApoioRelacao: z.string().trim().max(100).optional(),
});

export type AlunoFormValues = z.infer<typeof alunoFormSchema>;
