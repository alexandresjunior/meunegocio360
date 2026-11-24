import { Alert, Button } from 'react-bootstrap'

export function ErrorAlert({
  children,
  onRetry,
  retryLabel = 'Tentar novamente',
}) {
  return (
    <Alert variant="danger" role="alert">
      <div>{children}</div>
      {onRetry && (
        <Button
          type="button"
          className="mt-3"
          variant="outline-dark"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </Alert>
  )
}
