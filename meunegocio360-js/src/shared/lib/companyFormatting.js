export function onlyDigits(value) {
  return value.replace(/\D/g, '')
}

export function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14)

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11)

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function isValidCnpj(value) {
  const digits = onlyDigits(value)
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
    return false
  }

  const calculateDigit = (base, weights) => {
    const sum = [...base].reduce(
      (total, digit, index) => total + Number(digit) * weights[index],
      0,
    )
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const firstDigit = calculateDigit(
    digits.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  )
  const secondDigit = calculateDigit(
    digits.slice(0, 12) + firstDigit,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  )

  return digits.endsWith(`${firstDigit}${secondDigit}`)
}

export function isValidCpf(value) {
  const digits = onlyDigits(value)
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false
  }

  const calculateDigit = (base, weights) => {
    const sum = [...base].reduce(
      (total, digit, index) => total + Number(digit) * weights[index],
      0,
    )
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const firstDigit = calculateDigit(
    digits.slice(0, 9),
    [10, 9, 8, 7, 6, 5, 4, 3, 2],
  )
  const secondDigit = calculateDigit(
    digits.slice(0, 9) + firstDigit,
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  )

  return digits.endsWith(`${firstDigit}${secondDigit}`)
}

export function formatDocument(value, tipoPessoa) {
  return tipoPessoa === 'FISICA' ? formatCpf(value) : formatCnpj(value)
}

export function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) {
    return digits
  }

  const areaCode = digits.slice(0, 2)
  const number = digits.slice(2)
  const prefixLength = digits.length > 10 ? 5 : 4
  if (number.length <= prefixLength) {
    return `(${areaCode}) ${number}`
  }

  return `(${areaCode}) ${number.slice(0, prefixLength)}-${number.slice(prefixLength)}`
}

export function formatStoredCnpj(value) {
  return value ? formatCnpj(value) : '—'
}

export function formatStoredPhone(value) {
  return value ? formatPhone(value) : '—'
}
