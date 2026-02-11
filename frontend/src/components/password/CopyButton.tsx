import React, { useState } from 'react';
import { Button } from '../common/Button';

interface CopyButtonProps {
  text: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="secondary"
      size="md"
      className="whitespace-nowrap"
    >
      {copied ? '✓ Copied!' : '📋 Copy'}
    </Button>
  );
};
