import { useState, useEffect } from 'react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Confirm', disabled = false }) {
  return (
    <div className="modal-backdrop" onClick={!disabled ? onCancel : undefined} id="confirm-modal">
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2>{title}</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>{message}</p>
        <div className="form-actions">
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
