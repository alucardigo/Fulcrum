import { Module } from '@nestjs/common';
// Atualmente, a máquina de estados é importada diretamente onde é usada.
// Se precisarmos prover instâncias configuradas da máquina ou serviços de workflow,
// eles seriam declarados e exportados aqui.

@Module({
  providers: [],
  exports: [],
})
export class WorkflowModule {}
