# Mapeamento Academico

## Objetivo

Organizar os vinculos academicos dos alunos PCDs para apoiar o acompanhamento semestral, a comunicacao com docentes e a consulta por curso, disciplina, turma ou professor.

## Atores

- Coordenador do NIPNE.
- Bolsista do NIPNE.
- Equipe do NIPNE.
- Professor.

## Funcionalidades esperadas

- Manter cursos, disciplinas, turmas, professores e periodos letivos da unidade academica.
- Associar alunos a cursos, disciplinas, turmas e professores em cada semestre letivo.
- Consultar alunos por curso, disciplina, turma ou professor.
- Permitir que professores consultem alunos PCDs vinculados as turmas e disciplinas sob sua responsabilidade.
- Gerar mapeamento de alunos PCDs por docente.
- Apoiar o envio do mapeamento aos docentes, respeitando apenas as informacoes relacionadas as turmas do professor.

## Regras para IA

- Evite duplicar dados academicos; prefira vinculos entre estudante, curso, disciplina, turma, professor e periodo letivo.
- O mapeamento e uma resposta direta ao retrabalho semestral descrito no TCC; priorize filtros, tabelas claras e exportacao/encaminhamento quando aplicavel.
- Professores nao devem acessar alunos sem vinculo academico com suas turmas ou disciplinas.
- Mudancas em turmas, disciplinas e professores devem preservar rastreabilidade por periodo letivo.

## Rastreabilidade

- Requisitos: RF05, RF06, RF07, RF20.
- Casos de uso: UC06, UC07, UC08, UC09, UC10.
