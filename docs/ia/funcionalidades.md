# Funcionalidades Consolidadas

Esta matriz resume os grupos funcionais do sistema conforme o TCC. Use-a como indice de rastreabilidade antes de implementar ou revisar funcionalidades.

| Modulo | Requisitos | Casos de uso | Atores principais | Objetivo |
| --- | --- | --- | --- | --- |
| Cadastro e identificacao de alunos | RF01, RF02, RF03, RF04 | UC01, UC02, UC03, UC04, UC05 | Aluno PCD, Equipe do NIPNE | Manter cadastro centralizado, autoidentificacao, consentimento, importacao de cotistas e atualizacao de dados pessoais. |
| Mapeamento academico | RF05, RF06, RF07, RF20 | UC06, UC07, UC08, UC09, UC10 | Equipe do NIPNE, Professor | Manter dados academicos, associar alunos a cursos/turmas/professores e gerar mapeamento por docente. |
| Escuta e acompanhamento inicial | RF08, RF09, RF10, RF14 | UC11, UC12, UC13 | Aluno PCD, Coordenador do NIPNE, Equipe do NIPNE | Agendar, registrar, atualizar e preservar a escuta mediada no historico do aluno. |
| PAAI | RF11, RF12, RF13, RF14 | UC14, UC15, UC16 | Coordenador do NIPNE, Professor, Usuarios autorizados | Gerar, revisar, finalizar, comunicar, consultar e versionar o Plano de Acessibilidade Academica Individual. |
| Ocorrencias academicas | RF15, RF16, RF23 | UC17, UC18, UC19, UC20 | Aluno PCD, Professor, Equipe do NIPNE | Registrar, consultar, acompanhar, classificar e resolver ocorrencias academicas. |
| Documentos e historico | RF17, RF18 | UC21, UC22, UC23 | Usuarios autorizados, Equipe do NIPNE, Comite Gestor | Vincular documentos, consultar historico e exportar documentos de acompanhamento. |
| Gestao institucional | RF19, RF21, RF22, RF23 | UC24, UC25, UC26, UC27, UC28 | Coordenador do NIPNE, Representante do Comite Gestor, Administrador | Consultar dados consolidados, indicadores, estrutura institucional, perfis, vinculos e equipe do NIPNE. |

## Requisitos funcionais do TCC

- RF01: permitir o cadastro de alunos PCDs acompanhados pelo NIPNE, incluindo alunos ingressantes por cotas e por ampla concorrencia.
- RF02: permitir que o aluno realize sua autoidentificacao inicial, informando dados necessarios ao acompanhamento institucional.
- RF03: permitir o registro do consentimento do aluno para continuidade do acompanhamento pelo NIPNE.
- RF04: permitir a consulta, complementacao e atualizacao dos dados dos alunos acompanhados.
- RF05: permitir associar alunos a cursos, disciplinas, turmas e professores em cada semestre letivo.
- RF06: permitir consultar alunos por curso, disciplina, turma ou professor.
- RF07: permitir gerar o mapeamento de alunos PCDs por docente, apoiando a comunicacao inicial com os professores.
- RF08: permitir o gerenciamento da agenda de escuta mediada, incluindo agendamento, remarcacao e cancelamento.
- RF09: permitir o registro das informacoes coletadas durante a escuta mediada pela coordenacao do NIPNE.
- RF10: manter as informacoes da escuta vinculadas ao historico de acompanhamento do aluno.
- RF11: permitir a elaboracao do Plano de Acessibilidade Academica Individual (PAAI) com base nas informacoes registradas na escuta.
- RF12: permitir que o PAAI seja revisado, ajustado e finalizado pela coordenacao antes de sua disponibilizacao.
- RF13: permitir a consulta do PAAI por usuarios autorizados, respeitando perfil de acesso e vinculo institucional.
- RF14: permitir o registro de novas versoes da escuta e do PAAI quando houver mudancas nas necessidades do aluno.
- RF15: permitir que alunos e professores registrem ocorrencias relacionadas ao acompanhamento academico.
- RF16: permitir que a equipe do NIPNE acompanhe ocorrencias registradas, incluindo classificacao, comentarios, providencias e situacao de atendimento.
- RF17: permitir a vinculacao de documentos ao cadastro e ao historico de acompanhamento do aluno.
- RF18: permitir a consulta ao historico de acompanhamento do aluno, incluindo escutas, PAAIs, documentos e ocorrencias.
- RF19: permitir a consulta de informacoes consolidadas sobre alunos acompanhados, escolas, cursos e atividades realizadas.
- RF20: permitir a manutencao de dados academicos da unidade, incluindo cursos, disciplinas, turmas e professores.
- RF21: permitir o gerenciamento da estrutura institucional necessaria ao funcionamento da aplicacao, incluindo escolas, usuarios, perfis e vinculos.
- RF22: permitir que o coordenador gerencie a equipe do NIPNE de sua unidade, incluindo cadastro, vinculo, ativacao e desativacao de bolsistas.
- RF23: apoiar o envio ou registro de notificacoes relacionadas a eventos relevantes do acompanhamento, como conclusao de escuta, novas demandas ou atualizacao de documentos.

## Casos de uso do TCC

- UC01: realizar autoidentificacao do aluno PCD perante o NIPNE.
- UC02: realizar a primeira etapa da escuta pelo aluno PCD.
- UC03: importar alunos ingressantes por cotas.
- UC04: manter cadastro de alunos acompanhados.
- UC05: manter dados pessoais do aluno.
- UC06: manter dados academicos da unidade.
- UC07: consultar alunos por vinculo academico.
- UC08: consultar alunos matriculados nas turmas do professor.
- UC09: gerar mapeamento de alunos por docente.
- UC10: enviar mapeamento aos docentes.
- UC11: gerenciar agenda de escuta mediada.
- UC12: registrar escuta mediada.
- UC13: atualizar registro da escuta mediada.
- UC14: gerar PAAI.
- UC15: comunicar PAAI ao professor responsavel.
- UC16: consultar PAAI dos alunos do professor.
- UC17: registrar ocorrencia academica.
- UC18: consultar ocorrencia academica.
- UC19: consultar ocorrencias academicas pela equipe do NIPNE.
- UC20: resolver ocorrencias academicas.
- UC21: consultar documentos de acompanhamento.
- UC22: consultar historico de documentos do aluno.
- UC23: exportar todos os documentos de um aluno.
- UC24: consultar informacoes institucionais da propria unidade.
- UC25: consultar informacoes institucionais por unidade.
- UC26: acompanhar indicadores institucionais.
- UC27: gerenciar equipe do NIPNE da unidade.
- UC28: gerenciar estrutura institucional e perfis de acesso.
