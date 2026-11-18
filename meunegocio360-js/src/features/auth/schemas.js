import { z } from 'zod'

/** Formulário de login: espelha as regras do servidor (RNF-FE-20, RN-11 do backend). */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .max(160, 'Informe um e-mail válido.')
    .pipe(z.email('Informe um e-mail válido.')),
  senha: z
    .string()
    .min(1, 'Informe sua senha.')
    .min(8, 'A senha deve ter entre 8 e 72 caracteres.')
    .max(72, 'A senha deve ter entre 8 e 72 caracteres.'),
})

/** Resposta de /auth/login e /auth/refresh (contrato do RF-BE-001). */
export const sessaoSchema = z.object({
  tokenType: z.literal('Bearer'),
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
  usuario: z.object({
    id: z.string(),
    nome: z.string(),
    email: z.string(),
    perfil: z.string(),
  }),
})
