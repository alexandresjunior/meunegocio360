import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

const VALID_SITUATIONS = new Set(['ATIVO', 'INATIVO', 'TODOS'])
const SEARCH_DEBOUNCE_MS = 400

export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const appliedQuery = searchParams.get('q') || ''
  const rawSituation = searchParams.get('situacao')
  const situation = VALID_SITUATIONS.has(rawSituation) ? rawSituation : 'ATIVO'
  const rawPage = searchParams.get('page')
  const parsedPage = Number(rawPage)
  const page =
    rawPage !== null && Number.isInteger(parsedPage) && parsedPage >= 0
      ? parsedPage
      : 0
  const [queryDraft, setQueryDraft] = useState({
    source: appliedQuery,
    value: appliedQuery,
  })
  const query =
    queryDraft.source === appliedQuery ? queryDraft.value : appliedQuery

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    let changed = false

    if (!next.has('q')) {
      next.set('q', '')
      changed = true
    }
    if (!VALID_SITUATIONS.has(next.get('situacao'))) {
      next.set('situacao', 'ATIVO')
      changed = true
    }
    if (rawPage === null || !Number.isInteger(parsedPage) || parsedPage < 0) {
      next.set('page', '0')
      changed = true
    }

    if (changed) {
      setSearchParams(next, { replace: true })
    }
  }, [parsedPage, rawPage, searchParams, setSearchParams])

  useEffect(() => {
    const normalized = query.trim()
    if (normalized === appliedQuery) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('q', normalized)
          next.set('page', '0')
          return next
        },
        { replace: true },
      )
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [appliedQuery, query, setSearchParams])

  const setSituation = useCallback(
    (nextSituation) => {
      if (!VALID_SITUATIONS.has(nextSituation)) {
        return
      }

      const normalizedQuery = query.trim()
      setQueryDraft({ source: appliedQuery, value: normalizedQuery })
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('q', normalizedQuery)
          next.set('situacao', nextSituation)
          next.set('page', '0')
          return next
        },
        { replace: true },
      )
    },
    [appliedQuery, query, setSearchParams],
  )

  const setPage = useCallback(
    (nextPage) => {
      if (!Number.isInteger(nextPage) || nextPage < 0) {
        return
      }

      const normalizedQuery = query.trim()
      setQueryDraft({ source: appliedQuery, value: normalizedQuery })
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('q', normalizedQuery)
          next.set('situacao', situation)
          next.set('page', String(nextPage))
          return next
        },
        { replace: true },
      )
    },
    [appliedQuery, query, setSearchParams, situation],
  )

  const clearFilters = useCallback(() => {
    setQueryDraft({ source: appliedQuery, value: '' })
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set('q', '')
        next.set('situacao', 'ATIVO')
        next.set('page', '0')
        return next
      },
      { replace: true },
    )
  }, [appliedQuery, setSearchParams])

  const updateQuery = useCallback(
    (value) => setQueryDraft({ source: appliedQuery, value }),
    [appliedQuery],
  )

  return {
    query,
    appliedQuery,
    situation,
    page,
    setQuery: updateQuery,
    setSituation,
    setPage,
    clearFilters,
    hasFilters: Boolean(query.trim()) || situation !== 'ATIVO',
  }
}
