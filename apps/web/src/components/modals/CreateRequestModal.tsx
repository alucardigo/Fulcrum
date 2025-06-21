'use client';

import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from 'ui/components/Modal'; // Do packages/ui
// Assumindo que teremos componentes de formulário em ui (Button, Input, Select, Textarea, Label)
// Se não, usaremos HTML básico ou mocks.
// import { Button } from 'ui/components/Button';
// import { Input } from 'ui/components/Input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/components/Select';
// import { Textarea } from 'ui/components/Textarea';
// import { Label } from 'ui/components/Label';
import { useRequestStore, PurchaseRequest } from '@/stores/useRequestStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { showSuccessToast, showErrorToast } from 'ui/components/ToastInvokers';
import { X } from 'lucide-react';

// Mock de componentes de formulário se não disponíveis em 'ui'
const InputMock = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} {...props} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50" />
));
InputMock.displayName = "InputMock";

const TextareaMock = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea ref={ref} {...props} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50" />
));
TextareaMock.displayName = "TextareaMock";

const SelectMock = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & {children: React.ReactNode}>((props, ref) => (
  <select ref={ref} {...props} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50">
    {props.children}
  </select>
));
SelectMock.displayName = "SelectMock";

const LabelMock: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & {children: React.ReactNode}> = (props) => (
  <label {...props} className="block text-sm font-medium text-gray-700 mb-1">{props.children}</label>
);

const ButtonMock: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: string; children: React.ReactNode}> = ({children, variant, ...props}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantStyle = variant === 'outline'
    ? "border border-input hover:bg-accent hover:text-accent-foreground"
    : "bg-primary text-primary-foreground hover:bg-primary/90"; // Assume primary color for default
  return <button className={`${baseStyle} ${variantStyle} px-4 py-2`} {...props}>{children}</button>;
}


// Schema de validação com Zod
const requestSchema = z.object({
  itemName: z.string().min(3, 'Nome do item deve ter pelo menos 3 caracteres.'),
  projectId: z.string().min(1, 'Projeto é obrigatório.'),
  quantity: z.number().min(1, 'Quantidade deve ser pelo menos 1.'),
  reason: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres.'),
  urgency: z.enum(['Baixa', 'Média', 'Alta'], { errorMap: () => ({ message: "Nível de urgência é obrigatório."}) }),
  purchaseLink: z.string().url('Link da compra deve ser uma URL válida.').optional().or(z.literal('')),
});

type RequestFormData = z.infer<typeof requestSchema>;

// Mock de dados para selects
const mockItems = [
  { id: 'item-001', name: 'Licença Software X' },
  { id: 'item-002', name: 'Monitor Adicional 27"' },
  { id: 'item-003', name: 'Cadeira Ergonómica' },
  { id: 'item-004', name: 'Serviço de Cloud AWS' },
  { id: 'item-005', name: 'Teclado Mecânico' },
];

const mockProjects = [
  { id: 'proj-alpha', name: 'Projeto Alpha' },
  { id: 'proj-beta', name: 'Projeto Beta' },
  { id: 'proj-gamma', name: 'Projeto Gamma' },
  { id: 'proj-infra', name: 'Infraestrutura Escritório' },
];

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRequestModal({ isOpen, onClose }: CreateRequestModalProps) {
  const { addRequest, isLoading: isSubmitting } = useRequestStore();
  const { user } = useAuthStore();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      itemName: '', // Ou um item padrão
      projectId: '', // Ou um projeto padrão
      quantity: 1,
      reason: '',
      urgency: undefined, // Para que o placeholder do select apareça
      purchaseLink: '',
    },
  });

  const onSubmit: SubmitHandler<RequestFormData> = async (data) => {
    try {
      const requestData: Omit<PurchaseRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        ...data,
        quantity: Number(data.quantity), // Garantir que é número
        // userId: user?.id, // Adicionar ID do utilizador logado
        // projectName: mockProjects.find(p => p.id === data.projectId)?.name, // Adicionar nome do projeto
      };
      await addRequest(requestData);
      showSuccessToast('Requisição criada com sucesso!');
      reset();
      onClose();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Falha ao criar requisição.');
    }
  };

  const handleCloseModal = () => {
    reset(); // Limpa o formulário ao fechar
    onClose();
  };

  // Usar os componentes reais se disponíveis, senão os mocks
  const Input = InputMock; // Ou Input (do Shadcn/UI)
  const Textarea = TextareaMock; // Ou Textarea
  const Select = SelectMock; // Ou Select
  const Label = LabelMock; // Ou Label
  const ActualButton = ButtonMock; // Ou Button

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Criar Nova Requisição de Compra">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
        {/* Item (Select) - No futuro, poderia ser um Autocomplete ou Combobox do Shadcn */}
        <div>
          <Label htmlFor="itemName">Item</Label>
          <Controller
            name="itemName" // Nome do campo no schema Zod
            control={control}
            render={({ field }) => (
              // Usando um input por agora, idealmente seria um select com os itens mockados
              // ou um componente de busca de item.
              // Para simplificar, vamos usar um campo de texto para o nome do item.
              // Se fosse um select de itens mockados:
              // <Select onValueChange={field.onChange} defaultValue={field.value}>
              //   <SelectTrigger id="itemName"><SelectValue placeholder="Selecione um item..." /></SelectTrigger>
              //   <SelectContent>
              //     {mockItems.map(item => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
              //   </SelectContent>
              // </Select>
              <Input id="itemName" {...field} placeholder="Ex: Monitor Dell 27 polegadas" />
            )}
          />
          {errors.itemName && <p className="text-xs text-red-500 mt-1">{errors.itemName.message}</p>}
        </div>

        <div>
          <Label htmlFor="projectId">Projeto</Label>
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <Select id="projectId" {...field} defaultValue="">
                <option value="" disabled>Selecione um projeto...</option>
                {mockProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.projectId && <p className="text-xs text-red-500 mt-1">{errors.projectId.message}</p>}
        </div>

        <div>
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            {...register('quantity', { valueAsNumber: true })}
            placeholder="1"
          />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
        </div>

        <div>
          <Label htmlFor="reason">Motivo da Compra</Label>
          <Textarea
            id="reason"
            {...register('reason')}
            placeholder="Descreva o motivo da necessidade deste item..."
          />
          {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
        </div>

        <div>
          <Label htmlFor="urgency">Nível de Urgência</Label>
           <Controller
            name="urgency"
            control={control}
            render={({ field }) => (
              <Select id="urgency" {...field} defaultValue="">
                <option value="" disabled>Selecione a urgência...</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </Select>
            )}
          />
          {errors.urgency && <p className="text-xs text-red-500 mt-1">{errors.urgency.message}</p>}
        </div>

        <div>
          <Label htmlFor="purchaseLink">Link da Compra (Opcional)</Label>
          <Input
            id="purchaseLink"
            {...register('purchaseLink')}
            placeholder="https://exemplo.com/produto"
          />
          {errors.purchaseLink && <p className="text-xs text-red-500 mt-1">{errors.purchaseLink.message}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <ActualButton type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
            Cancelar
          </ActualButton>
          <ActualButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Requisição'}
          </ActualButton>
        </div>
      </form>
    </Modal>
  );
}
