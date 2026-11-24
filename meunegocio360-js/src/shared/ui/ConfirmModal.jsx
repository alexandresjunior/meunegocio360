import { Button, Modal } from 'react-bootstrap'

export function ConfirmModal({
  show,
  title,
  children,
  confirmLabel = 'Confirmar',
  confirming = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      aria-labelledby="confirm-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="confirm-modal-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant="outline-dark"
          onClick={onCancel}
          disabled={confirming}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onConfirm}
          disabled={confirming}
        >
          {confirming ? 'Aguarde...' : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
