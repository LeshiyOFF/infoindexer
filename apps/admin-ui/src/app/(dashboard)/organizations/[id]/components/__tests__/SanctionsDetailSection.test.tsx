/**
 * SanctionsDetailSection Test
 *
 * Тестирует компонент отображения санкций:
 * 1. Рендеринг с пустым списком
 * 2. Рендеринг с санкциями
 * 3. Активные/снятые санкции
 * 4. Memo optimization
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SanctionsDetailSection } from '../SanctionsDetailSection';
import type { SanctionDTO } from 'shared/client';

const mockSanctions: readonly SanctionDTO[] = [
  {
    id: '1',
    inn: '7702217631',
    program: 'EU-RUSSIA-SANCTIONS',
    programId: 'eu-russia',
    authority: 'European Union',
    country: 'eu',
    startDate: '2022-02-26T00:00:00Z',
    endDate: null,
    sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R0269',
    isActive: true
  },
  {
    id: '2',
    inn: '7702217631',
    program: 'UK-RUSSIA-SANCTIONS',
    programId: 'uk-russia',
    authority: 'United Kingdom',
    country: 'gb',
    startDate: '2022-03-15T00:00:00Z',
    endDate: '2023-01-01T00:00:00Z',
    sourceUrl: 'https://gov.uk/government/collections/uk-sanctions-on-russia',
    isActive: false
  }
];

describe('SanctionsDetailSection', () => {
  describe('Empty State', () => {
    it('должен показывать сообщение когда санкций нет', () => {
      render(<SanctionsDetailSection sanctions={[]} />);

      expect(screen.getByText(/санкций не обнаружено/i)).toBeInTheDocument();
    });

    it('должен показывать правильный styling для empty state', () => {
      const { container } = render(<SanctionsDetailSection sanctions={[]} />);

      const card = container.querySelector('.border-emerald-200');
      expect(card).toBeInTheDocument();
    });

    it('должен применять custom className', () => {
      const { container } = render(
        <SanctionsDetailSection sanctions={[]} className="custom-class" />
      );

      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });
  });

  describe('With Sanctions', () => {
    it('должен показывать заголовок секции', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText(/Sanctions.*Risk Indicators/i)).toBeInTheDocument();
    });

    it('должен показывать количество санкционных программ', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText(/2 санкционн/i)).toBeInTheDocument();
    });

    it('должен показывать количество активных санкций', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText(/\(1 активн/i)).toBeInTheDocument();
    });

    it('должен показывать disclaimer', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText(/Источник: OpenSanctions/i)).toBeInTheDocument();
      expect(screen.getByText(/Данные требуют верификации/i)).toBeInTheDocument();
    });
  });

  describe('SanctionCard', () => {
    it('должен показывать программу санкции', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText('EU-RUSSIA-SANCTIONS')).toBeInTheDocument();
    });

    it('должен показывать authority', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText('European Union')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    });

    it('должен показывать статус для активной санкции', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText('активна')).toBeInTheDocument();
    });

    it('должен показывать статус для снятой санкции', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText('снята')).toBeInTheDocument();
    });

    it('должен показывать период с датой начала', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText(/26\.02\.2022/)).toBeInTheDocument();
    });

    it('должен показывать период с датой окончания', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      expect(screen.getByText(/15\.03\.2022.*01\.01\.2023/)).toBeInTheDocument();
    });

    it('должен показывать ссылку на документ', () => {
      render(<SanctionsDetailSection sanctions={mockSanctions} />);

      const links = screen.getAllByText('Документ');
      expect(links.length).toBeGreaterThan(0);
    });

    it('должен иметь correct styling для активной санкции', () => {
      const { container } = render(<SanctionsDetailSection sanctions={mockSanctions} />);

      const activeCard = container.querySelector('.bg-red-50\\/80');
      expect(activeCard).toBeInTheDocument();
    });

    it('должен иметь correct styling для снятой санкции', () => {
      const { container } = render(<SanctionsDetailSection sanctions={mockSanctions} />);

      const inactiveCard = container.querySelector('.bg-gray-50\\/80');
      expect(inactiveCard).toBeInTheDocument();
    });
  });

  describe('Readonly Props', () => {
    it('должен принимать readonly sanctions array', () => {
      const readonlySanctions: readonly SanctionDTO[] = Object.freeze([...mockSanctions]);

      expect(() => {
        render(<SanctionsDetailSection sanctions={readonlySanctions} />);
      }).not.toThrow();
    });

    it('должен принимать readonly className', () => {
      const readonlyClassName: string = 'custom-class' as const;

      const { container } = render(
        <SanctionsDetailSection sanctions={[]} className={readonlyClassName} />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});

describe('SanctionsDetailSection: Edge Cases', () => {
  it('должен обрабатывать одну санкцию без множественного числа', () => {
    const singleSanction: readonly SanctionDTO[] = [
      {
        id: '1',
        inn: '7702217631',
        program: 'TEST',
        programId: 'test',
        authority: 'Test',
        country: 'eu',
        startDate: '2022-01-01T00:00:00Z',
        endDate: null,
        sourceUrl: 'https://example.com',
        isActive: true
      }
    ];

    render(<SanctionsDetailSection sanctions={singleSanction} />);

    expect(screen.getByText(/1 санкционн/i)).toBeInTheDocument();
  });

  it('должен показывать все активные когда все активны', () => {
    const allActiveSanctions: readonly SanctionDTO[] = [
      { ...mockSanctions[0], isActive: true },
      { ...mockSanctions[1], isActive: true }
    ];

    render(<SanctionsDetailSection sanctions={allActiveSanctions} />);

    expect(screen.getByText(/\(2 активн/i)).toBeInTheDocument();
  });

  it('должен показывать 0 активных когда все сняты', () => {
    const allInactiveSanctions: readonly SanctionDTO[] = [
      { ...mockSanctions[0], isActive: false },
      { ...mockSanctions[1], isActive: false }
    ];

    render(<SanctionsDetailSection sanctions={allInactiveSanctions} />);

    // Не должно быть текста с количеством активных
    const activeText = screen.queryByText(/\(\d+ активн/i);
    expect(activeText).not.toBeInTheDocument();
  });

  it('должен обрабатывать очень длинные названия программ', () => {
    const longNameSanction: readonly SanctionDTO[] = [
      {
        id: '1',
        inn: '7702217631',
        program: 'A'.repeat(200), // Очень длинное название
        programId: 'test',
        authority: 'Test',
        country: 'eu',
        startDate: '2022-01-01T00:00:00Z',
        endDate: null,
        sourceUrl: 'https://example.com',
        isActive: true
      }
    ];

    const { container } = render(<SanctionsDetailSection sanctions={longNameSanction} />);

    // Проверяем, что длинный текст обрезается (truncate class)
    const truncated = container.querySelector('.truncate');
    expect(truncated).toBeInTheDocument();
  });
});
