# Cadastro e Identificacao de Alunos

## Objetivo

Centralizar a identificacao e manutencao dos alunos PCDs acompanhados pelo NIPNE, incluindo estudantes ingressantes por cotas e por ampla concorrencia.

## Atores

- Aluno PCD.
- Coordenador do NIPNE.
- Bolsista do NIPNE.
- Equipe do NIPNE.

## Funcionalidades esperadas

- Permitir autoidentificacao inicial do aluno PCD, com dados necessarios ao acompanhamento institucional.
- Registrar o consentimento do aluno para continuidade do acompanhamento pelo NIPNE.
- Permitir a primeira etapa da escuta preenchida pelo aluno, quando o fluxo exigir dados preliminares.
- Importar ou cadastrar alunos ingressantes por cotas a partir de listas encaminhadas institucionalmente.
- Manter cadastro centralizado de alunos acompanhados pela unidade academica.
- Permitir consulta, complementacao e atualizacao dos dados dos alunos acompanhados.
- Permitir que o aluno consulte e atualize seus proprios dados pessoais dentro dos limites do perfil.

## Regras para IA

- Nao trate cadastro de aluno como dado generico: ele faz parte do acompanhamento institucional e deve se conectar a escutas, documentos, PAAIs, ocorrencias e historico.
- Preserve diferenca entre alunos por cotas e por ampla concorrencia, pois o TCC identifica ambos como cenarios de entrada.
- Sempre considerar consentimento quando o fluxo envolver autoidentificacao, escuta ou continuidade do acompanhamento.
- Respeite acesso: o aluno so deve manipular seus proprios dados; equipe do NIPNE atua sobre alunos da unidade.

## Rastreabilidade

- Requisitos: RF01, RF02, RF03, RF04.
- Casos de uso: UC01, UC02, UC03, UC04, UC05.
