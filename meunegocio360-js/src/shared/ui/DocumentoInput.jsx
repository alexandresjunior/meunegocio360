import { Form } from 'react-bootstrap'
import { formatDocument } from '../lib/companyFormatting.js'

export function DocumentoInput({
  tipoPessoa,
  value,
  onChange,
  onBlur,
  id,
  inputRef,
  invalid = false,
  describedBy,
}) {
  const label = tipoPessoa === 'FISICA' ? 'CPF' : 'CNPJ'

  return (
    <Form.Control
      id={id}
      type="text"
      ref={inputRef}
      inputMode="numeric"
      autoComplete="off"
      maxLength={tipoPessoa === 'FISICA' ? 14 : 18}
      placeholder={
        tipoPessoa === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'
      }
      value={formatDocument(value || '', tipoPessoa)}
      onChange={(event) =>
        onChange(formatDocument(event.target.value, tipoPessoa))
      }
      onBlur={onBlur}
      isInvalid={invalid}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      aria-label={label}
    />
  )
}
