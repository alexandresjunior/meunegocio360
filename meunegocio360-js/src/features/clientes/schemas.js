import { z } from 'zod'
import {
  isValidCnpj,
  isValidCpf,
  onlyDigits,
} from '../../shared/lib/companyFormatting.js'

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

export const clienteSchema = z
  .object({
    tipoPessoa: z
      .string()
      .refine(
        (value) => value === 'FISICA' || value === 'JURIDICA',
        'Selecione o tipo de pessoa.',
      ),
    nome: z
      .string()
      .trim()
      .min(2, 'Informe o nome.')
      .max(150, 'O nome deve ter no máximo 150 caracteres.'),
    documento: z.string().transform(onlyDigits),
    email: optionalEmail,
    telefone: optionalPhone,
  })
  .superRefine((data, context) => {
    if (!data.documento) {
      context.addIssue({
        code: 'custom',
        path: ['documento'],
        message: 'Informe o documento.',
      })
      return
    }

    if (data.tipoPessoa === 'FISICA' && !isValidCpf(data.documento)) {
      context.addIssue({
        code: 'custom',
        path: ['documento'],
        message: 'CPF inválido.',
      })
    } else if (data.tipoPessoa === 'JURIDICA' && !isValidCnpj(data.documento)) {
      context.addIssue({
        code: 'custom',
        path: ['documento'],
        message: 'CNPJ inválido.',
      })
    }
  })
