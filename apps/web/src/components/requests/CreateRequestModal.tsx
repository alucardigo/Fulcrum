"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useRequestStore from '../../stores/useRequestStore'; // Adjust if necessary
import { RequisicaoCompraPrioridade, ItemRequisicao } from '@fulcrum/shared'; // Assuming these types are available

// Zod Schema for Validation
const itemSchema = z.object({
  nome: z.string().min(3, { message: "Nome do item deve ter pelo menos 3 caracteres." }),
  quantidade: z.number({ invalid_type_error: "Quantidade deve ser um número." }).min(1, { message: "Quantidade deve ser maior que zero." }),
  descricao: z.string().optional(),
  precoUnitario: z.number({ invalid_type_error: "Preço deve ser um número." }).optional(),
  // fornecedor: z.string().optional(), // Add more fields as needed
  // urlProduto: z.string().url({ message: "URL inválida." }).optional(),
});

const createRequestSchema = z.object({
  titulo: z.string().min(5, { message: "Título deve ter pelo menos 5 caracteres." }),
  descricao: z.string().optional(),
  prioridade: z.nativeEnum(RequisicaoCompraPrioridade).default(RequisicaoCompraPrioridade.MEDIA),
  itens: z.array(itemSchema).min(1, { message: "Adicione pelo menos um item à requisição." }),
});

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ isOpen, onClose }) => {
  const { createRequest: storeCreateRequest, isLoading } = useRequestStore();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      prioridade: RequisicaoCompraPrioridade.MEDIA,
      itens: [{ nome: '', quantidade: 1, descricao: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });

  const onSubmit = async (data: CreateRequestFormData) => {
    console.log("Form data submitted:", data);
    // The store's createRequest expects a slightly different structure for items
    // (Omit<ItemRequisicao, 'id' | 'precoTotal'>[])
    // The current itemSchema is compatible if we ensure only relevant fields are passed.
    // The store mock also calculates precoTotal.
    const submissionData = {
        ...data,
        // idRequisitante is handled by the store's mock for now
    };

    try {
      const result = await storeCreateRequest(submissionData);
      if (result) {
        alert("Requisição criada com sucesso!"); // Replace with a proper toast notification
        reset();
        onClose();
      } else {
        alert("Falha ao criar requisição. Verifique o console.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Erro ao submeter requisição.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-8 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <button
          onClick={() => { reset(); onClose(); }}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
          aria-label="Fechar modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Criar Nova Requisição</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título da Requisição</label>
            <input
              id="titulo"
              type="text"
              {...register("titulo")}
              className={`mt-1 block w-full px-3 py-2 border ${errors.titulo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.titulo && <p className="mt-1 text-xs text-red-600">{errors.titulo.message}</p>}
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
            <textarea
              id="descricao"
              {...register("descricao")}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700">Prioridade</label>
            <select
              id="prioridade"
              {...register("prioridade")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Object.values(RequisicaoCompraPrioridade).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Itens da Requisição</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-md space-y-3 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`itens.${index}.nome`} className="block text-xs font-medium text-gray-600">Nome do Item</label>
                    <input
                      id={`itens.${index}.nome`}
                      type="text"
                      {...register(`itens.${index}.nome`)}
                      className={`mt-1 block w-full px-2 py-1.5 border ${errors.itens?.[index]?.nome ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.itens?.[index]?.nome && <p className="mt-1 text-xs text-red-600">{errors.itens[index]?.nome?.message}</p>}
                  </div>
                  <div>
                    <label htmlFor={`itens.${index}.quantidade`} className="block text-xs font-medium text-gray-600">Quantidade</label>
                    <input
                      id={`itens.${index}.quantidade`}
                      type="number"
                      {...register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                      className={`mt-1 block w-full px-2 py-1.5 border ${errors.itens?.[index]?.quantidade ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500`}
                      defaultValue={1}
                    />
                    {errors.itens?.[index]?.quantidade && <p className="mt-1 text-xs text-red-600">{errors.itens[index]?.quantidade?.message}</p>}
                  </div>
                </div>
                <div>
                    <label htmlFor={`itens.${index}.descricao`} className="block text-xs font-medium text-gray-600">Descrição do Item (Opcional)</label>
                    <input
                      id={`itens.${index}.descricao`}
                      type="text"
                      {...register(`itens.${index}.descricao`)}
                      className={`mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                </div>
                 <div>
                    <label htmlFor={`itens.${index}.precoUnitario`} className="block text-xs font-medium text-gray-600">Preço Unitário (Opcional)</label>
                    <input
                      id={`itens.${index}.precoUnitario`}
                      type="number"
                       step="0.01"
                      {...register(`itens.${index}.precoUnitario`, { valueAsNumber: true,setValueAs: v => v === '' ? undefined : parseFloat(v) })}
                      className={`mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500`}
                    />
                     {errors.itens?.[index]?.precoUnitario && <p className="mt-1 text-xs text-red-600">{errors.itens[index]?.precoUnitario?.message}</p>}
                </div>


                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Remover Item
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ nome: '', quantidade: 1, descricao: '' })}
              className="mt-2 px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              + Adicionar Outro Item
            </button>
            {errors.itens && !errors.itens.length && typeof errors.itens.message === 'string' && ( // For array-level error like min(1)
                <p className="mt-1 text-xs text-red-600">{errors.itens.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Requisição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
