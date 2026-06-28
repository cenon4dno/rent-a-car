'use client';

import { useState } from 'react';
import { CardDetails } from '@/lib/api';

interface CardPaymentFormProps {
  onCardDetails: (details: CardDetails | null) => void;
}

export function CardPaymentForm({ onCardDetails }: CardPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const parseExpiry = (v: string): { month: number; year: number } | null => {
    const [m, y] = v.split('/');
    const month = parseInt(m, 10);
    const year = parseInt(`20${y}`, 10);
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return null;
    return { month, year };
  };

  const handleChange = (field: 'cardNumber' | 'expiry' | 'cvc' | 'cardHolder', raw: string) => {
    const next: { cardNumber: string; expiry: string; cvc: string; cardHolder: string } = {
      cardNumber,
      expiry,
      cvc,
      cardHolder,
    };

    if (field === 'cardNumber') {
      next.cardNumber = formatCardNumber(raw);
      setCardNumber(next.cardNumber);
    } else if (field === 'expiry') {
      next.expiry = formatExpiry(raw);
      setExpiry(next.expiry);
    } else if (field === 'cvc') {
      next.cvc = raw.replace(/\D/g, '').slice(0, 4);
      setCvc(next.cvc);
    } else {
      next.cardHolder = raw.toUpperCase();
      setCardHolder(next.cardHolder);
    }

    const parsed = parseExpiry(next.expiry);
    const digits = next.cardNumber.replace(/\s/g, '');
    if (digits.length === 16 && parsed && next.cvc.length >= 3 && next.cardHolder.trim()) {
      onCardDetails({
        cardNumber: digits,
        expMonth: parsed.month,
        expYear: parsed.year,
        cvc: next.cvc,
        cardHolder: next.cardHolder.trim(),
      });
    } else {
      onCardDetails(null);
    }
  };

  return (
    <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      {/* Card number */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Card Number</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => handleChange('cardNumber', e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        {/* Expiry */}
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Expiry</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => handleChange('expiry', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* CVC */}
        <div className="w-24">
          <label className="text-xs text-gray-500 mb-1 block">CVC</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvc}
            onChange={(e) => handleChange('cvc', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cardholder */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Name on Card</label>
        <input
          type="text"
          placeholder="JUAN DELA CRUZ"
          value={cardHolder}
          onChange={(e) => handleChange('cardHolder', e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Secured by PayMongo • Your card details are encrypted
      </p>
    </div>
  );
}
