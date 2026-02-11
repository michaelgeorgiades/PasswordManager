import React, { useState, useEffect } from 'react';
import { PasswordGeneratorOptions, PasswordStrength } from '@passwordpal/shared';
import { generatePassword, calculatePasswordStrength } from '../../utils/passwordGenerator';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { CopyButton } from './CopyButton';
import { Button } from '../common/Button';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onPasswordGenerated,
}) => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>('weak');
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const handleGenerate = () => {
    try {
      const newPassword = generatePassword(options);
      const newStrength = calculatePasswordStrength(newPassword, options);

      setPassword(newPassword);
      setStrength(newStrength);

      if (onPasswordGenerated) {
        onPasswordGenerated(newPassword);
      }
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [options]);

  const handleOptionChange = (key: keyof PasswordGeneratorOptions, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const atLeastOneOptionSelected =
    options.uppercase || options.lowercase || options.numbers || options.symbols;

  return (
    <div className="space-y-6">
      {/* Generated Password Display */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={password}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <CopyButton text={password} />
          <Button onClick={handleGenerate} size="md">
            🔄 Regenerate
          </Button>
        </div>
        <PasswordStrengthMeter strength={strength} />
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        {/* Length Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Length
            </label>
            <span className="text-sm font-semibold text-primary-600">
              {options.length}
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="128"
            value={options.length}
            onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>8</span>
            <span>128</span>
          </div>
        </div>

        {/* Character Type Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => handleOptionChange('uppercase', e.target.checked)}
              disabled={options.uppercase && !options.lowercase && !options.numbers && !options.symbols}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Uppercase Letters (A-Z)
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => handleOptionChange('lowercase', e.target.checked)}
              disabled={!options.uppercase && options.lowercase && !options.numbers && !options.symbols}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Lowercase Letters (a-z)
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) => handleOptionChange('numbers', e.target.checked)}
              disabled={!options.uppercase && !options.lowercase && options.numbers && !options.symbols}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Numbers (0-9)
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) => handleOptionChange('symbols', e.target.checked)}
              disabled={!options.uppercase && !options.lowercase && !options.numbers && options.symbols}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Symbols (!@#$%^&*)
            </span>
          </label>
        </div>

        {!atLeastOneOptionSelected && (
          <p className="text-sm text-red-600">
            At least one character type must be selected
          </p>
        )}
      </div>
    </div>
  );
};
