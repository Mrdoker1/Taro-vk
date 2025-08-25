import React from 'react';
import { ModalRoot, ModalPage, ModalPageHeader, Div, Button, Text } from '@vkontakte/vkui';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Да",
  cancelText = "Отмена"
}) => {
  if (!isOpen) return null;

  return (
    <ModalRoot activeModal="confirmation" onClose={onClose}>
      <ModalPage
        id="confirmation"
        header={
          <ModalPageHeader>
            {title}
          </ModalPageHeader>
        }
      >
        <Div style={{ padding: '16px' }}>
          <Text style={{ 
            color: '#ffffff',
            marginBottom: '24px',
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            {message}
          </Text>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <Button
              mode="tertiary"
              size="m"
              onClick={onClose}
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {cancelText}
            </Button>
            <Button
              mode="primary"
              size="m"
              onClick={onConfirm}
              style={{
                background: 'rgba(210, 175, 80, 1)',
                color: '#000'
              }}
            >
              {confirmText}
            </Button>
          </div>
        </Div>
      </ModalPage>
    </ModalRoot>
  );
};
