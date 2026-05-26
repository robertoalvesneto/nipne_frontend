# Escuta e Acompanhamento Inicial

## Objetivo

Apoiar o fluxo de escuta do aluno PCD, dividindo dados preliminares, agenda da escuta mediada e registro das informacoes aprofundadas no historico de acompanhamento.

## Atores

- Aluno PCD.
- Coordenador do NIPNE.
- Bolsista do NIPNE.
- Equipe do NIPNE.

## Funcionalidades esperadas

- Gerenciar agenda de escuta mediada, incluindo agendamento, remarcacao e cancelamento.
- Registrar informacoes coletadas durante a escuta mediada pela coordenacao do NIPNE.
- Atualizar o registro da escuta mediada quando surgirem novas informacoes sobre o aluno.
- Manter as informacoes da escuta vinculadas ao historico de acompanhamento.
- Permitir novas versoes da escuta quando houver mudancas nas necessidades do aluno.
- Apoiar notificacoes relacionadas a conclusao de escuta ou novas demandas, quando o fluxo exigir.

## Regras para IA

- A escuta nao e um formulario isolado: ela alimenta historico, PAAI, documentos e necessidades de acompanhamento.
- Preserve a diferenca entre primeira etapa da escuta, preenchida pelo aluno, e escuta mediada, conduzida pela coordenacao.
- Mudancas posteriores devem gerar atualizacao ou nova versao, nao sobrescrever historico relevante sem rastreabilidade.
- Ao criar telas, consulte `../../figma/coordenador/atendimentos` e `../../figma/usuarios/meus dados` para fluxos de agendamento e estado da escuta.

## Rastreabilidade

- Requisitos: RF08, RF09, RF10, RF14, RF23.
- Casos de uso: UC11, UC12, UC13.
