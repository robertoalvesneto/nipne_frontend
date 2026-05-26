# Ocorrencias Academicas

## Objetivo

Permitir registro, consulta, acompanhamento e resolucao de ocorrencias relacionadas ao acompanhamento academico dos alunos PCDs.

## Atores

- Aluno PCD.
- Professor.
- Usuario academico.
- Coordenador do NIPNE.
- Bolsista do NIPNE.
- Equipe do NIPNE.

## Funcionalidades esperadas

- Permitir que alunos e professores registrem ocorrencias academicas.
- Permitir que alunos e professores consultem ocorrencias registradas por eles ou relacionadas ao proprio acompanhamento.
- Permitir que a equipe do NIPNE consulte ocorrencias registradas pelos usuarios.
- Classificar ocorrencias, registrar comentarios, providencias e situacao de atendimento.
- Atualizar status e finalizar o tratamento de ocorrencias academicas.
- Apoiar notificacoes relacionadas a novas demandas ou atualizacoes importantes.

## Regras para IA

- Ocorrencias devem ter rastreabilidade de status, comentarios e providencias; evite tratar como texto livre sem fluxo.
- A equipe do NIPNE precisa de visao operacional para acompanhar demandas; alunos e professores precisam de visao limitada ao que lhes diz respeito.
- Mantenha linguagem acolhedora e institucional em formularios, erros e confirmacoes.
- Ao criar telas, consulte `../../figma/usuarios/minhas ocorrências` e, quando houver telas exportadas, os fluxos de coordenador relacionados a ocorrencias.

## Rastreabilidade

- Requisitos: RF15, RF16, RF23.
- Casos de uso: UC17, UC18, UC19, UC20.
