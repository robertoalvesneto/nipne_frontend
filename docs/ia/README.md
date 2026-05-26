# Instrucoes de IA do Sistema NIPNE

Esta pasta organiza as funcionalidades do Sistema de Gestao NIPNE para orientar agentes de IA durante manutencoes, implementacoes e revisoes do frontend.

## Fontes de verdade

- `../tcc.pdf`: fonte principal para requisitos, atores, problemas, casos de uso e objetivos do sistema.
- `../diagrama de classe/diagrama de classe.png`: referencia do modelo de dominio, entidades, enums e relacionamentos.
- `../figma/`: referencia visual para telas, fluxos, menus, hierarquia de acoes e linguagem de interface.
- `../../AGENTS.md`: instrucoes gerais do repositorio, incluindo a regra de leitura da documentacao local do Next.js antes de alterar codigo.

## Como usar

- Antes de implementar uma funcionalidade, identifique o modulo correspondente em `modulos/`.
- Confira a rastreabilidade em `funcionalidades.md` para localizar os requisitos funcionais (`RF`) e casos de uso (`UC`) envolvidos.
- Quando houver conflito entre codigo existente e documentacao, trate o TCC, o diagrama de classe e o Figma como fontes preferenciais e registre a decisao na entrega.
- Nao invente perfis, campos, fluxos ou permissoes sem apoio no TCC, no diagrama ou nas telas exportadas.

## Mapa de modulos

- [Funcionalidades consolidadas](funcionalidades.md)
- [Cadastro e identificacao de alunos](modulos/cadastro-alunos.md)
- [Mapeamento academico](modulos/mapeamento-academico.md)
- [Escuta e acompanhamento inicial](modulos/escuta.md)
- [PAAI](modulos/paai.md)
- [Ocorrencias academicas](modulos/ocorrencias.md)
- [Documentos e historico](modulos/documentos-historico.md)
- [Gestao institucional](modulos/gestao-institucional.md)

## Principios para agentes

- Acompanhar o aluno PCD ao longo de sua trajetoria academica e preservar o historico institucional.
- Reduzir informacoes dispersas, retrabalho, registros manuais e baixa rastreabilidade.
- Respeitar perfis, vinculos academicos e limites de acesso a dados sensiveis.
- Manter linguagem em portugues do Brasil e vocabulos do dominio: aluno PCD, escuta, escuta mediada, PAAI, ocorrencia, unidade academica, turma, disciplina, periodo letivo e acompanhamento.
- Preferir funcionalidades rastreaveis a requisitos do TCC em vez de telas ou comportamentos genericos.
