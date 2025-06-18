// packages/shared/src/index.ts

export type Usuario = {
  id: string;
  email: string;
  nome?: string;
  primeiroNome?: string;
  ultimoNome?: string;
  estaAtivo?: boolean;
};

export type Papel = {
  id: string;
  nome: string;
  permissoes?: string[];
};

export type CriarUsuarioDto = {
  email: string;
  senha?: string;
  primeiroNome?: string;
  ultimoNome?: string;
  papeisIds?: string[];
};

export type RequisicaoCompraStatus =
  | 'PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'EM_COTACAO'
  | 'PEDIDO_REALIZADO'
  | 'ENTREGUE_PARCIALMENTE'
  | 'ENTREGUE_TOTALMENTE'
  | 'CANCELADA';

export type RequisicaoCompraPrioridade = 'BAIXA' | 'MEDIA' | 'ALTA';

export type ItemRequisicao = {
  id?: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  precoUnitario?: number;
  precoTotal?: number;
  fornecedor?: string;
  urlProduto?: string;
};

export type RequisicaoCompra = {
  id: string;
  titulo: string;
  descricao?: string;
  status: RequisicaoCompraStatus;
  prioridade: RequisicaoCompraPrioridade;
  valorTotalEstimado?: number;
  idRequisitante: string;
  requisitante?: Usuario;
  idProjeto?: string;
  projeto?: Projeto;
  itens: ItemRequisicao[];
  criadoEm: string;
  atualizadoEm: string;
};

export type CriarRequisicaoCompraDto = {
  titulo: string;
  descricao?: string;
  idProjeto?: string;
  prioridade?: RequisicaoCompraPrioridade;
  itens: Array<Omit<ItemRequisicao, 'id' | 'precoTotal'>>;
};

export type Projeto = {
  id: string;
  nome: string;
  descricao?: string;
  orcamento?: number;
  idGestor: string;
  gestor?: Usuario;
  criadoEm: string;
  atualizadoEm: string;
};

export type RespostaLogin = {
  accessToken: string;
  usuario?: Usuario;
};
