import { z } from 'zod'

// Espelha as regras do LoginRequest do backend, sem substituí-las (RNF-FE-20, RNF-020).
// Regras e mensagens: requisitos-fe.md, RF-FE-001, "Campos e validações do formulário".
const MENSAGEM_TAMANHO_SENHA = 'A senha deve ter entre 8 e 72 caracteres.'

export const esquemaLogin = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    // A spec só prevê duas mensagens para o e-mail; acima de 160 caracteres ele é inválido.
    .max(160, 'Informe um e-mail válido.')
    .pipe(z.email('Informe um e-mail válido.')),
  senha: z
    .string()
    .min(1, 'Informe sua senha.')
    .min(8, MENSAGEM_TAMANHO_SENHA)
    .max(72, MENSAGEM_TAMANHO_SENHA),
})
