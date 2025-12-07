import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onChoose: (mode: 'einfach' | 'komplex') => void;
};

export default function ExportModal({ open, onClose, onChoose }: Props) {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)'
    }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 420 }}>
        <h3 style={{ marginTop: 0 }}>Export-Optionen</h3>
        <p>Bitte wählen Sie die gewünschte Export-Art:</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button onClick={() => onChoose('einfach')} style={{ flex: 1, padding: '8px 12px' }}>
            Einfach — nur Jahreswerte
          </button>
          <button onClick={() => onChoose('komplex')} style={{ flex: 1, padding: '8px 12px' }}>
            Komplex — detaillierte Tageswerte
          </button>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '6px 10px', color: '#666' }}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}