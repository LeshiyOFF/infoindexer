/**
 * Card для отображения контакта
 *
 * @remarks
 * Переиспользуемый компонент для отображения контакта организации.
 */

"use client";

import { memo } from 'react';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { abbreviateLegalForm } from '@/lib/companyName';
import type { ContactItem } from '@/lib/batch-contact.utils';

/** Props для ContactCard */
export interface ContactCardProps {
  readonly contact: ContactItem;
}

/**
 * Contact Card
 */
export const ContactCard = memo(function ContactCard({ contact }: ContactCardProps) {
  const { inn, name, director, val, type, source, kind } = contact;

  const isRelevant = type === 'direct';

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center justify-between gap-2 mb-1">
        <Link
          href={`/organizations/${inn}`}
          className="font-bold truncate text-gray-900 hover:text-gray-700 hover:underline transition-colors"
        >
          {abbreviateLegalForm(name)}
        </Link>
        <span
          className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
            isRelevant
              ? 'bg-gray-200 text-gray-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isRelevant ? 'Релевантно' : 'Нерелевантно'}
        </span>
      </div>
      {director && (
        <p className="text-xs text-gray-500 mb-2">{director}</p>
      )}
      <a
        href={kind === 'phone' ? `tel:${val}` : `mailto:${val}`}
        className="font-mono font-bold text-gray-700 hover:text-black truncate block transition-colors duration-200"
      >
        {kind === 'phone' ? (
          <>
            <Phone className="w-4 h-4 inline mr-1.5 align-middle" />
            {val}
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 inline mr-1.5 align-middle" />
            {val}
          </>
        )}
      </a>
      <p className="text-[9px] text-gray-500 mt-1">{source}</p>
    </div>
  );
});
