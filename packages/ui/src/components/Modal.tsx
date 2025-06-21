import React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react'; // Ícone para o botão de fechar

// Estas seriam idealmente importações de @radix-ui/react-dialog ou similar,
// que são as primitivas usadas pelo Shadcn/UI Dialog.
// Por agora, vamos mockar a estrutura básica.

// Mock das primitivas do Radix UI Dialog (ou equivalente Shadcn)
const DialogRoot = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  if (!open) return null;
  // Simula o gerenciamento de estado de abertura/fechamento
  // Em uma implementação real, Radix cuidaria disso internamente se 'open' e 'onOpenChange' não fossem controlados.
  return <div className="fixed inset-0 z-50 overflow-y-auto">{children}</div>;
};

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
  // Em uma implementação real, este componente clonaria seu filho para adicionar a funcionalidade de trigger.
  // Para este mock, ele apenas renderiza o filho. Se asChild for true, espera-se um único filho ReactElement.
  if (asChild && React.isValidElement(children)) {
     // Simplificação: não estamos clonando props aqui, apenas retornando o filho.
     // Uma implementação real usaria React.cloneElement para passar onClick, etc.
    return children;
  }
  return <button>{children}</button>; // Fallback se não for asChild ou se o filho não for um elemento válido
};


const DialogPortal = ({ children }: { children: React.ReactNode }) => {
  // Em Radix, isto teleportaria o conteúdo para o body ou outro container.
  // Para o mock, apenas renderiza os filhos diretamente.
  return <>{children}</>;
};

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0',
      className
    )}
    {...props}
  />
)));
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void; title?: string }
>(({ className, children, onClose, title, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay onClick={onClose} /> {/* Adicionado onClick para fechar ao clicar no overlay */}
    <div
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
        'gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95',
        'sm:rounded-lg md:w-full',
        className
      )}
      {...props}
    >
      {title && (
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
        </div>
      )}
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string; // Para o DialogContent
  trigger?: React.ReactNode; // Opcional, para modo não controlado
}

export function Modal({ isOpen, onClose, title, children, className, trigger }: ModalProps) {
  // Se um trigger for fornecido, assumimos um modo não controlado internamente (simplificado)
  // No entanto, a prop `isOpen` e `onClose` sugerem um modal controlado, que é mais comum para programaticamente abrir/fechar.
  // Para este exemplo, vamos priorizar o modo controlado se isOpen for passado.

  // Se não houver trigger, o modal é puramente controlado por isOpen/onClose
  if (!trigger) {
    if (!isOpen) return null;
    return (
      <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent title={title} onClose={onClose} className={className}>
          {children}
        </DialogContent>
      </DialogRoot>
    );
  }

  // Se houver trigger, tentamos um modo "semi-controlado" ou "não controlado"
  // A lógica aqui é uma simplificação. Radix UI faria isso de forma mais robusta.
  // Para este exemplo, vamos assumir que se `isOpen` é fornecido, ele controla o estado.
  // Se não, o trigger controla (o que não está totalmente implementado neste mock simples).
  // Para simplificar, vamos manter o controle via isOpen, e o trigger é apenas visual.

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* O DialogTrigger do Radix normalmente controlaria o estado 'open' do DialogRoot se não fosse controlado externamente.
          Como estamos passando 'open' e 'onOpenChange' para DialogRoot, ele está em modo controlado.
          O trigger aqui é mais um placeholder visual ou para cenários onde o DialogTrigger real do Radix seria usado.
      */}
      {/* <DialogTrigger asChild>{trigger}</DialogTrigger> */}
      <DialogContent title={title} onClose={onClose} className={className}>
        {children}
      </DialogContent>
    </DialogRoot>
  );
}

// Para usar o Modal de forma mais parecida com o Dialog do Shadcn/UI, exportamos os subcomponentes também (mesmo que mockados)
Modal.Root = DialogRoot;
Modal.Trigger = DialogTrigger;
Modal.Content = DialogContent;
Modal.Overlay = DialogOverlay;
// Adicionar outros como Header, Footer, Title, Description se necessário.
// Modal.Header = DialogHeader; (precisaria definir DialogHeader)
// Modal.Footer = DialogFooter; (precisaria definir DialogFooter)
// Modal.Title = DialogTitle; (precisaria definir DialogTitle)
// Modal.Description = DialogDescription; (precisaria definir DialogDescription)
