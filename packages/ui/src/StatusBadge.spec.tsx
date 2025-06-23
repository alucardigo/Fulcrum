import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge, BadgeStatus } from './StatusBadge'; // Adjust path as necessary

describe('StatusBadge Component', () => {
  it('should render the status text correctly', () => {
    render(<StatusBadge status="PENDENTE" />);
    expect(screen.getByText('PENDENTE')).toBeInTheDocument();
  });

  it('should render status text with underscores replaced by spaces', () => {
    render(<StatusBadge status="ENTREGUE_TOTALMENTE" />);
    expect(screen.getByText('ENTREGUE TOTALMENTE')).toBeInTheDocument();
  });

  const statusColorMap: Array<[BadgeStatus, string, string]> = [
    ['PENDENTE', 'Pendente', 'bg-yellow-100'],
    ['PENDENTE_COMPRAS', 'Pendente Compras', 'bg-yellow-100'],
    ['PENDENTE_GERENCIA', 'Pendente Gerencia', 'bg-yellow-100'],
    ['APROVADA', 'Aprovada', 'bg-green-100'],
    ['REJEITADA', 'Rejeitada', 'bg-red-100'],
    ['EM_COTACAO', 'Em Cotacao', 'bg-blue-100'],
    ['PEDIDO_REALIZADO', 'Pedido Realizado', 'bg-purple-100'],
    ['ENTREGUE_PARCIALMENTE', 'Entregue Parcialmente', 'bg-teal-100'],
    ['ENTREGUE_TOTALMENTE', 'Entregue Totalmente', 'bg-emerald-100'],
    ['CANCELADA', 'Cancelada', 'bg-slate-100'],
    ['RASCUNHO', 'Rascunho', 'bg-stone-100'],
  ];

  statusColorMap.forEach(([statusValue, expectedText, expectedBgClass]) => {
    it(`should apply correct classes for status "${statusValue}"`, () => {
      // Normalize expectedText for comparison if statusValue contains underscores
      const displayText = typeof statusValue === 'string' ? statusValue.replace(/_/g, ' ') : String(statusValue);
      render(<StatusBadge status={statusValue} />);
      const badgeElement = screen.getByText(displayText);
      expect(badgeElement).toHaveClass(expectedBgClass);
    });
  });

  it('should apply default classes for an unknown string status', () => {
    render(<StatusBadge status="STATUS_DESCONHECIDO_XYZ" />);
    const badgeElement = screen.getByText('STATUS DESCONHECIDO XYZ');
    expect(badgeElement).toHaveClass('bg-gray-200'); // Default background
    expect(badgeElement).toHaveClass('text-gray-800'); // Default text color
  });

  it('should render "Status Desconhecido" and default classes if status is not a known string type or pattern', () => {
    // Test with a status that doesn't match any case and isn't a typical string enum
    render(<StatusBadge status={123 as any} />); // Using 'as any' to bypass type checking for test
    const badgeElement = screen.getByText('Status Desconhecido');
    expect(badgeElement).toHaveClass('bg-gray-200');
    expect(badgeElement).toHaveClass('text-gray-800');
  });

  it('should apply additional className if provided', () => {
    render(<StatusBadge status="PENDENTE" className="extra-class-test" />);
    const badgeElement = screen.getByText('PENDENTE');
    expect(badgeElement).toHaveClass('extra-class-test');
    expect(badgeElement).toHaveClass('bg-yellow-100'); // Ensure original classes are also there
  });

  it('should render normalized text for statuses with mixed case or extra spaces in the component logic', () => {
    // The component normalizes input like "Pendente Compras" to "PENDENTE_COMPRAS" for switch cases
    // This test ensures the displayed text is still the original input if it's a string
    render(<StatusBadge status="Pendente Gerencia" />);
    expect(screen.getByText('Pendente Gerencia')).toBeInTheDocument();
    expect(screen.getByText('Pendente Gerencia')).toHaveClass('bg-yellow-100');

    render(<StatusBadge status="aprovada" />); // Testing lowercase
    expect(screen.getByText('aprovada')).toBeInTheDocument();
    expect(screen.getByText('aprovada')).toHaveClass('bg-green-100');
  });
});
