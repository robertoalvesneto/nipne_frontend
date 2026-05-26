# Documentos e Historico

## Objetivo

Preservar documentos de acompanhamento e historico longitudinal do aluno, reunindo escutas, PAAIs, anexos, respostas estruturadas e ocorrencias.

## Atores

- Usuarios autorizados.
- Equipe do NIPNE.
- Coordenador do NIPNE.
- Representante do Comite Gestor.

## Funcionalidades esperadas

- Vincular documentos ao cadastro e ao historico de acompanhamento do aluno.
- Consultar documentos de acompanhamento conforme perfil e vinculo institucional.
- Consultar historico de documentos vinculados ao aluno ao longo do acompanhamento.
- Exportar todos os documentos de um aluno quando permitido.
- Manter historico de escutas, PAAIs, documentos e ocorrencias.
- Preservar versoes de documentos e respostas quando o modelo de dominio exigir.

## Regras para IA

- Documentos devem ser tratados como parte do historico de acompanhamento, nao como arquivos avulsos.
- O diagrama de classe indica modelos, secoes, campos, respostas, arquivos e regras de preenchimento; use essa estrutura como referencia para formularios documentais.
- Usuarios autorizados devem consultar apenas o que seu perfil e vinculo permitirem.
- Exportacao documental deve respeitar permissoes e dados sensiveis de alunos PCDs.

## Rastreabilidade

- Requisitos: RF17, RF18.
- Casos de uso: UC21, UC22, UC23.
