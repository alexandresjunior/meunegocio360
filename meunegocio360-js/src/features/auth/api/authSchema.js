import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .max(160, "O e-mail deve ter no máximo 160 caracteres.")
    .email("Informe um e-mail válido."),
  senha: z
    .string()
    .min(1, "Informe sua senha.")
    .min(8, "A senha deve ter entre 8 e 72 caracteres.")
    .max(72, "A senha deve ter entre 8 e 72 caracteres."),
});

const loginResponseSchema = z.object({
  tokenType: z.literal("Bearer"),
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
  usuario: z.object({
    id: z.string(),
    nome: z.string(),
    email: z.string(),
    perfil: z.string(),
  }),
});

export function parseLoginResponse(payload) {
  const result = loginResponseSchema.safeParse(payload);
  if (!result.success) {
    throw new Error("A API retornou dados de sessão inválidos.");
  }

  return result.data;
}
