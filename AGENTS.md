<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Instrucoes para agentes de IA

## Antes de alterar o projeto

- Leia estas instrucoes e preserve-as ao editar este arquivo.
- Consulte a documentacao local de Next.js em `node_modules/next/dist/docs/` antes de alterar rotas, layouts, Server Components, Client Components, metadados, cache, fontes, imagens, formularios ou APIs do framework.
- Use `docs/tcc.pdf` como fonte principal de contexto, requisitos, atores, problemas e objetivos do sistema.
- Use `docs/diagrama de classe/diagrama de classe.png` como referencia do modelo de dominio e dos relacionamentos entre entidades.
- Use `docs/figma/` como fonte de verdade visual para telas, fluxos, nomenclatura de menus e hierarquia de acoes.
- Use `docs/ia/` como referencia detalhada de funcionalidades, modulos, requisitos funcionais e casos de uso extraidos do TCC.
- Nao invente fluxos, perfis ou campos quando houver referencia em `docs/`; primeiro alinhe com o TCC, o diagrama e as telas exportadas.

## Contexto do produto

- O sistema e uma aplicacao de gestao do NIPNE, voltada ao acompanhamento institucional de alunos PCDs na Universidade do Estado do Amazonas.
- A solucao deve reduzir informacoes dispersas, retrabalho no mapeamento semestral, registros manuais, escutas desconectadas do historico e baixa rastreabilidade de ocorrencias.
- O produto deve centralizar dados academicos, escutas, PAAIs, documentos, ocorrencias, historico e consultas institucionais.
- A linguagem da interface deve ser `pt-BR`, com termos do dominio do NIPNE: aluno PCD, escuta, escuta mediada, PAAI, ocorrencia, unidade academica, turma, disciplina, periodo letivo e acompanhamento.

## Atores e acesso

- Considere como atores do sistema: Aluno PCD, Professor, Coordenador do NIPNE, Bolsista do NIPNE, Representante do Comite Gestor e Administrador.
- O diagrama de dominio usa `PerfilUsuario` com `GESTOR`, `COORDENADOR`, `BOLSISTA`, `ALUNO` e `PROFESSOR`; trate o representante do Comite Gestor como perfil institucional de gestao quando nao houver perfil separado.
- Respeite vinculos institucionais: professores acessam apenas alunos/turmas vinculados, alunos acessam seus proprios dados, coordenadores e bolsistas atuam na unidade, gestores consultam informacoes institucionais, administradores configuram estrutura/perfis.
- Nao exponha dados sensiveis de alunos PCDs fora do perfil e vinculo autorizados.
- Registre consentimento do aluno para continuidade do acompanhamento pelo NIPNE quando o fluxo envolver autoidentificacao ou escuta.

## Grupos funcionais esperados

- Cadastro e identificacao de alunos: cadastro centralizado, alunos por cotas e ampla concorrencia, autoidentificacao e atualizacao de dados.
- Mapeamento academico: cursos, disciplinas, turmas, professores, periodos letivos, matriculas e mapeamento de alunos PCDs por docente.
- Escuta e acompanhamento inicial: primeira etapa pelo aluno, agendamento, remarcacao, cancelamento e registro da escuta mediada pela coordenacao.
- PAAI: elaboracao com base na escuta, sugestoes quando aplicavel, revisao, ajustes, finalizacao, consulta por autorizados e versionamento.
- Ocorrencias academicas: registro por alunos/professores, classificacao, comentarios, providencias, acompanhamento de status e resolucao.
- Gestao documental: documentos vinculados ao aluno e ao historico, respostas estruturadas, arquivos gerados ou anexados e exportacao quando prevista.
- Gestao institucional e acesso: escolas/unidades, usuarios, perfis, vinculos, equipe do NIPNE, cursos, disciplinas, turmas e professores.
- Historico, relatorios e notificacoes: historico longitudinal do aluno, consultas consolidadas, indicadores e avisos sobre eventos relevantes.

## Modelo de dominio

- Preserve os conceitos do diagrama: `UnidadeAcademica`, `PessoaInstitucional`, `Usuario`, `Estudante`, `Professor`, `Curso`, `Disciplina`, `Turma`, `PeriodoLetivo`, `MatriculaCurso`, `MatriculaTurma`, `ModeloDocumento`, `DocumentoResposta`, `SecaoDocumento`, `CampoDocumento`, `CampoResposta`, `ArquivoDocumento`, `RegraPreenchimentoCampo`, contatos e enums.
- Um estudante pode ter multiplas matriculas de curso ao longo do tempo, mas apenas uma matricula de curso ativa por vez.
- Modele documentos como estruturas versionadas quando fizer sentido: modelo, secoes, campos, respostas, arquivos e versoes devem manter rastreabilidade.
- Trate escuta, PAAI, documentos e ocorrencias como parte do historico de acompanhamento do aluno.
- Evite duplicar entidades academicas; prefira associacoes entre estudante, curso, disciplina, turma, professor e periodo letivo.

## Diretrizes de UI

- Siga os arquivos em `docs/figma/` antes de criar ou alterar telas. As pastas estao organizadas por perfil e modulo, como `coordenador/alunos`, `coordenador/atendimentos`, `usuarios/meus dados`, `usuarios/minhas disciplinas` e `usuarios/minhas ocorrencias`.
- Pastas vazias em `docs/figma/` indicam areas planejadas sem tela exportada; nesse caso, derive o minimo necessario de telas equivalentes existentes e deixe a decisao clara no codigo ou na entrega.
- Preserve a identidade visual UEA/NIPNE: predominio de verde, fundo claro, cards brancos, bordas arredondadas, sombras leves, sidebar lateral, cabecalho com usuario e acoes bem destacadas.
- Mantenha textos, labels, botoes e mensagens em portugues.
- Use componentes acessiveis, estados visiveis de foco, contraste adequado e feedback claro para carregamento, vazio, erro e sucesso.
- Ao criar tabelas, formularios e filtros, priorize clareza operacional para coordenadores e bolsistas, pois esses perfis executam rotinas com muitos registros.

## Convencoes tecnicas

- O projeto usa Next.js `16.2.6`, React `19.2.4`, TypeScript, App Router em `src/app`, MUI, React Query, Redux Toolkit, Axios, React Hook Form, Zod e React Toastify.
- Siga a organizacao atual por dominio em `src/modules/<dominio>/` e recursos compartilhados em `src/shared/`.
- Use o alias `@/*` para imports a partir de `src`.
- Crie Client Components apenas quando houver interatividade, hooks de cliente, browser APIs, providers ou bibliotecas que exijam cliente. Caso contrario, prefira Server Components conforme a documentacao local do Next.
- Mantenha providers globais em componentes de provider dedicados e renderizados tao profundamente quanto possivel.
- Prefira schemas Zod e React Hook Form para formularios; centralize regras de validacao reutilizaveis em `schemas`.
- Use React Query para dados remotos e Axios via servicos compartilhados; evite chamadas HTTP espalhadas em componentes de tela.
- Execute `npm run lint` apos mudancas relevantes em codigo, quando possivel.

## Cuidado com requisitos

- Qualquer funcionalidade nova deve ser rastreavel a um requisito, fluxo do Figma, entidade do diagrama ou necessidade descrita no TCC.
- Se houver conflito entre implementacao atual e `docs/`, documente a suposicao na resposta final antes de expandir o comportamento.
- Nao remova regras de acesso, historico, versionamento ou consentimento para simplificar telas.
- Trate dados de alunos PCDs como sensiveis e evite logs desnecessarios, mocks ofensivos ou exemplos que exponham informacoes reais.
