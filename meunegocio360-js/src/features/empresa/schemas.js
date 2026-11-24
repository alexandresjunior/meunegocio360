import { z } from 'zod'
import { isValidCnpj, onlyDigits } from '../../shared/lib/companyFormatting.js'

const optionalEmail = z
  .string()
  .trim()
  .max(160, 'Informe um e-mail válido.')
  .refine((value) => !value || z.email().safeParse(value).success, {
    message: 'Informe um e-mail válido.',
  })
  .transform((value) => value || null)

const optionalPhone = z
  .string()
  .transform(onlyDigits)
  .refine((value) => !value || value.length === 10 || value.length === 11, {
    message: 'Informe um telefone válido com DDD.',
  })
  .transform((value) => value || null)

export const FUSOS_HORARIOS_BRASIL = Object.freeze([
  { value: 'America/Sao_Paulo', label: 'Brasília (UTC−03:00)' },
  { value: 'America/Manaus', label: 'Manaus (UTC−04:00)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (UTC−05:00)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC−02:00)' },
  { value: 'UTC', label: 'UTC' },
])

export const empresaSchema = z.object({
  razaoSocial: z
    .string()
    .trim()
    .min(3, 'Informe a razão social.')
    .max(150, 'A razão social deve ter no máximo 150 caracteres.'),
  nomeFantasia: z
    .string()
    .trim()
    .max(150, 'O nome fantasia deve ter no máximo 150 caracteres.')
    .transform((value) => value || null),
  cnpj: z
    .string()
    .transform(onlyDigits)
    .superRefine((value, context) => {
      if (!value) {
        context.addIssue({ code: 'custom', message: 'Informe o CNPJ.' })
      } else if (!isValidCnpj(value)) {
        context.addIssue({ code: 'custom', message: 'CNPJ inválido.' })
      }
    }),
  email: optionalEmail,
  telefone: optionalPhone,
  fusoHorario: z
    .string()
    .refine(
      (value) => FUSOS_HORARIOS_BRASIL.some((fuso) => fuso.value === value),
      'Selecione o fuso horário.',
    ),
  moeda: z.literal('BRL'),
})
