# Documentacao das rotas da API

Base URL local: `http://localhost:3000`

Prefixo global: `/api`

Versao atual dos recursos: `/v1`

Base dos endpoints versionados: `http://localhost:3000/api/v1`

Nao ha autenticacao configurada no codigo atual.

## Regras gerais

- Todos os bodies e queries passam por validacao.
- Campos extras sao rejeitados.
- UUID invalido em `:id` retorna `400`.
- Datas devem ser enviadas como string ISO ou `YYYY-MM-DD`.
- `Date` nas respostas chega ao frontend como string ISO.
- Endpoints de listagem retornam:

```ts
type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};
```

Query comum nas listagens:

| Campo | Tipo | Padrao | Validacao |
| --- | --- | --- | --- |
| `page` | number | `1` | inteiro, minimo `1` |
| `pageSize` | number | `10` | inteiro, minimo `1`, maximo `100` |
| `sortDirection` | string | `desc` | `asc` ou `desc` |

Booleanos em query aceitam somente `true` ou `false`.

Formato comum de erro do NestJS:

```ts
type ErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
```

Enums:

```ts
type CategoriaUnidadeAcademica =
  | 'ESCOLA_SUPERIOR'
  | 'CENTRO_ESTUDOS_SUPERIORES'
  | 'NUCLEO_ENSINO_SUPERIOR'
  | 'OUTRA';

type StatusMatriculaCurso =
  | 'ATIVA'
  | 'CONCLUIDA'
  | 'ENCERRADA'
  | 'TRANCADA';
```

## Resumo rapido

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/api` | Retorna `Hello World!` |
| `POST` | `/api/v1/users` | Cria usuario |
| `GET` | `/api/v1/users` | Lista usuarios |
| `POST` | `/api/v1/academic-units` | Cria unidade academica |
| `GET` | `/api/v1/academic-units` | Lista unidades academicas |
| `GET` | `/api/v1/academic-units/:id` | Busca unidade academica |
| `PATCH` | `/api/v1/academic-units/:id` | Atualiza unidade academica |
| `PATCH` | `/api/v1/academic-units/:id/activate` | Ativa unidade academica |
| `PATCH` | `/api/v1/academic-units/:id/deactivate` | Desativa unidade academica |
| `POST` | `/api/v1/courses` | Cria curso |
| `GET` | `/api/v1/courses` | Lista cursos |
| `GET` | `/api/v1/courses/:id` | Busca curso |
| `PATCH` | `/api/v1/courses/:id` | Atualiza curso |
| `PATCH` | `/api/v1/courses/:id/activate` | Ativa curso |
| `PATCH` | `/api/v1/courses/:id/deactivate` | Desativa curso |
| `POST` | `/api/v1/students` | Cria estudante |
| `GET` | `/api/v1/students` | Lista estudantes |
| `GET` | `/api/v1/students/:id` | Busca estudante |
| `PATCH` | `/api/v1/students/:id` | Atualiza estudante |
| `PATCH` | `/api/v1/students/:id/activate` | Ativa estudante |
| `PATCH` | `/api/v1/students/:id/deactivate` | Desativa estudante |
| `POST` | `/api/v1/course-enrollments` | Cria matricula em curso |
| `GET` | `/api/v1/course-enrollments` | Lista matriculas em curso |
| `GET` | `/api/v1/course-enrollments/:id` | Busca matricula em curso |
| `PATCH` | `/api/v1/course-enrollments/:id` | Atualiza matricula em curso |
| `POST` | `/api/v1/disciplines` | Cria disciplina |
| `GET` | `/api/v1/disciplines` | Lista disciplinas |
| `GET` | `/api/v1/disciplines/:id` | Busca disciplina |
| `PATCH` | `/api/v1/disciplines/:id` | Atualiza disciplina |
| `PATCH` | `/api/v1/disciplines/:id/activate` | Ativa disciplina |
| `PATCH` | `/api/v1/disciplines/:id/deactivate` | Desativa disciplina |
| `POST` | `/api/v1/academic-periods` | Cria periodo letivo |
| `GET` | `/api/v1/academic-periods` | Lista periodos letivos |
| `GET` | `/api/v1/academic-periods/:id` | Busca periodo letivo |
| `PATCH` | `/api/v1/academic-periods/:id` | Atualiza periodo letivo |
| `PATCH` | `/api/v1/academic-periods/:id/activate` | Ativa periodo letivo |
| `PATCH` | `/api/v1/academic-periods/:id/deactivate` | Desativa periodo letivo |
| `POST` | `/api/v1/professors` | Cria professor |
| `GET` | `/api/v1/professors` | Lista professores |
| `GET` | `/api/v1/professors/:id` | Busca professor |
| `PATCH` | `/api/v1/professors/:id` | Atualiza professor |
| `PATCH` | `/api/v1/professors/:id/activate` | Ativa professor |
| `PATCH` | `/api/v1/professors/:id/deactivate` | Desativa professor |
| `POST` | `/api/v1/class-groups` | Cria turma |
| `GET` | `/api/v1/class-groups` | Lista turmas |
| `GET` | `/api/v1/class-groups/:id` | Busca turma |
| `PATCH` | `/api/v1/class-groups/:id` | Atualiza turma |
| `PATCH` | `/api/v1/class-groups/:id/activate` | Ativa turma |
| `PATCH` | `/api/v1/class-groups/:id/deactivate` | Desativa turma |
| `POST` | `/api/v1/class-group-professors` | Vincula professor a turma |
| `GET` | `/api/v1/class-group-professors` | Lista vinculos professor-turma |
| `GET` | `/api/v1/class-group-professors/:id` | Busca vinculo professor-turma |
| `DELETE` | `/api/v1/class-group-professors/:id` | Remove vinculo professor-turma |

## Tipos de resposta compartilhados

```ts
type ActiveStatusResponse = {
  success: boolean;
  ativo: boolean;
  message: string;
};

type DeleteResponse = {
  success: boolean;
  message: string;
};

type InstitutionalPerson = {
  id: string;
  nome: string;
  nomeSocial?: string | null;
  emailInstitucional: string;
  matricula: string;
  createdAt: string;
  updatedAt: string;
};
```

## Usuarios

Response:

```ts
type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};
```

Observacao: o service atual retorna o usuario diretamente do Prisma, entao `password` aparece na resposta.

### `POST /api/v1/users`

Cria um usuario.

Status esperado: `201`.

Body:

```ts
type CreateUserBody = {
  name: string;
  email: string;
  password: string; // minimo 6 caracteres
};
```

Resposta: objeto `User` do Prisma.

### `GET /api/v1/users`

Lista usuarios.

Query: somente a query comum de paginacao.

Resposta:

```ts
type UsersListResponse = PaginatedResponse<User>;
```

## Unidades academicas

Response:

```ts
type AcademicUnit = {
  id: string;
  nome: string;
  sigla: string;
  categoria: CategoriaUnidadeAcademica;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### `POST /api/v1/academic-units`

Status esperado: `201`.

Body:

```ts
type CreateAcademicUnitBody = {
  nome: string; // max 150
  sigla: string; // max 20
  categoria: CategoriaUnidadeAcademica;
};
```

Resposta: `AcademicUnit`.

### `GET /api/v1/academic-units`

Query:

```ts
type AcademicUnitListQuery = {
  page?: number;
  pageSize?: number;
  nome?: string; // max 150
  sigla?: string; // max 20
  categoria?: CategoriaUnidadeAcademica;
  ativo?: boolean;
  sortBy?: 'nome' | 'sigla' | 'categoria' | 'createdAt'; // padrao createdAt
  sortDirection?: 'asc' | 'desc'; // padrao desc
};
```

Resposta: `PaginatedResponse<AcademicUnit>`.

### `GET /api/v1/academic-units/:id`

Resposta: `AcademicUnit`.

### `PATCH /api/v1/academic-units/:id`

Body parcial:

```ts
type UpdateAcademicUnitBody = Partial<CreateAcademicUnitBody>;
```

Resposta: `AcademicUnit`.

### `PATCH /api/v1/academic-units/:id/activate`

Resposta: `ActiveStatusResponse`.

### `PATCH /api/v1/academic-units/:id/deactivate`

Resposta: `ActiveStatusResponse`.

## Cursos

Response:

```ts
type Course = {
  id: string;
  nome: string;
  sigla: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  unidadeAcademica: AcademicUnit;
};
```

### `POST /api/v1/courses`

Status esperado: `201`.

Body:

```ts
type CreateCourseBody = {
  unidadeAcademicaId: string; // UUID
  nome: string; // max 150
  sigla: string; // max 30
};
```

Resposta: `Course`.

### `GET /api/v1/courses`

Query:

```ts
type CourseListQuery = {
  page?: number;
  pageSize?: number;
  unidadeAcademicaId?: string; // UUID
  nome?: string; // max 150
  sigla?: string; // max 30
  ativo?: boolean;
  sortBy?: 'nome' | 'sigla' | 'createdAt'; // padrao createdAt
  sortDirection?: 'asc' | 'desc'; // padrao desc
};
```

Resposta: `PaginatedResponse<Course>`.

### `GET /api/v1/courses/:id`

Resposta: `Course`.

### `PATCH /api/v1/courses/:id`

Body parcial:

```ts
type UpdateCourseBody = Partial<CreateCourseBody>;
```

Resposta: `Course`.

### `PATCH /api/v1/courses/:id/activate`

Resposta: `ActiveStatusResponse`.

### `PATCH /api/v1/courses/:id/deactivate`

Resposta: `ActiveStatusResponse`.

## Estudantes

Responses:

```ts
type PhoneContact = {
  id: string;
  telefone: string;
  descricao?: string | null;
  formaPreferencialContato: boolean;
  createdAt: string;
  updatedAt: string;
};

type EmailContact = {
  id: string;
  email: string;
  formaPreferencialContato: boolean;
  createdAt: string;
  updatedAt: string;
};

type SupportContact = {
  id: string;
  nome: string;
  telefone: string;
  relacao: string;
  createdAt: string;
  updatedAt: string;
};

type StudentCurrentCourse = {
  id: string;
  nome: string;
  sigla: string;
  matricula: string;
  status: StatusMatriculaCurso;
};

type StudentListItem = {
  id: string;
  ativo: boolean;
  dataNascimento?: string | null;
  createdAt: string;
  updatedAt: string;
  pessoaInstitucional: InstitutionalPerson;
  unidadeAcademica: AcademicUnit;
  cursoAtual: StudentCurrentCourse | null;
};

type Student = {
  id: string;
  dataNascimento?: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  pessoaInstitucional: InstitutionalPerson;
  unidadeAcademica: AcademicUnit;
  contatosTelefonicos: PhoneContact[];
  contatosEmails: EmailContact[];
  contatosApoio: SupportContact[];
};
```

### `POST /api/v1/students`

Status esperado: `201`.

Body:

```ts
type CreateStudentBody = {
  nome: string; // max 150
  nomeSocial?: string; // max 150
  emailInstitucional: string; // email, max 254
  matricula: string; // max 50
  dataNascimento?: string; // data ISO ou YYYY-MM-DD
  unidadeAcademicaId: string; // UUID
  contatosTelefonicos?: {
    telefone: string; // max 20
    formaPreferencialContato: boolean;
    descricao?: string; // max 100
  }[]; // max 10
  contatosEmails?: {
    email: string; // email, max 254
    formaPreferencialContato: boolean;
  }[]; // max 10
  contatosApoio?: {
    nome: string; // max 150
    telefone: string; // max 20
    relacao: string; // max 100
  }[]; // max 10
};
```

Regras adicionais:

- Maximo de 1 telefone preferencial.
- Maximo de 1 e-mail preferencial.
- `emailInstitucional` e `matricula` devem ser unicos.

Resposta: `Student`.

### `GET /api/v1/students`

Query:

```ts
type StudentListQuery = {
  page?: number;
  pageSize?: number;
  nome?: string; // max 150
  nomeSocial?: string; // max 150
  emailInstitucional?: string; // max 254
  matricula?: string; // max 50
  ativo?: boolean;
  unidadeAcademicaId?: string; // UUID
  sortBy?: 'nome' | 'nomeSocial' | 'emailInstitucional' | 'matricula' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};
```

Resposta: `PaginatedResponse<StudentListItem>`.

### `GET /api/v1/students/:id`

Resposta: `Student`.

### `PATCH /api/v1/students/:id`

Body parcial:

```ts
type UpdateStudentBody = Partial<CreateStudentBody>;
```

Observacao: se `contatosTelefonicos`, `contatosEmails` ou `contatosApoio` forem enviados no update, a lista correspondente e substituida pelo array enviado. Envie `[]` para remover todos daquele tipo.

Resposta: `Student`.

### `PATCH /api/v1/students/:id/activate`

Resposta: `ActiveStatusResponse`.

### `PATCH /api/v1/students/:id/deactivate`

Resposta: `ActiveStatusResponse`.

## Matriculas em curso

Response:

```ts
type EnrolledStudentSummary = {
  id: string;
  ativo: boolean;
  nome: string;
  nomeSocial?: string | null;
  emailInstitucional: string;
};

type CourseEnrollment = {
  id: string;
  matricula: string;
  matriculadoEm: string;
  status: StatusMatriculaCurso;
  createdAt: string;
  updatedAt: string;
  estudante: EnrolledStudentSummary;
  curso: Course;
};
```

### `POST /api/v1/course-enrollments`

Status esperado: `201`.

Body:

```ts
type CreateCourseEnrollmentBody = {
  estudanteId: string; // UUID
  cursoId: string; // UUID
  matricula: string; // max 50
  matriculadoEm: string; // data ISO ou YYYY-MM-DD
  status: StatusMatriculaCurso;
};
```

Regras adicionais:

- Nao cria matricula para estudante inativo.
- Nao vincula matricula a curso inativo.
- Estudante nao pode ter mais de uma matricula ativa em curso.

Resposta: `CourseEnrollment`.

### `GET /api/v1/course-enrollments`

Query:

```ts
type CourseEnrollmentListQuery = {
  page?: number;
  pageSize?: number;
  estudanteId?: string; // UUID
  cursoId?: string; // UUID
  matricula?: string; // max 50
  status?: StatusMatriculaCurso;
  sortBy?: 'matricula' | 'matriculadoEm' | 'status' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};
```

Resposta: `PaginatedResponse<CourseEnrollment>`.

### `GET /api/v1/course-enrollments/:id`

Resposta: `CourseEnrollment`.

### `PATCH /api/v1/course-enrollments/:id`

Body parcial:

```ts
type UpdateCourseEnrollmentBody = {
  cursoId?: string; // UUID
  matricula?: string; // max 50
  matriculadoEm?: string; // data ISO ou YYYY-MM-DD
  status?: StatusMatriculaCurso;
};
```

Resposta: `CourseEnrollment`.

## Disciplinas

Response:

```ts
type Discipline = {
  id: string;
  nome: string;
  cargaHoraria: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  curso: Course;
};
```

### `POST /api/v1/disciplines`

Status esperado: `201`.

Body:

```ts
type CreateDisciplineBody = {
  cursoId: string; // UUID
  nome: string; // max 150
  cargaHoraria: number; // inteiro entre 1 e 1000
};
```

Resposta: `Discipline`.

### `GET /api/v1/disciplines`

Query:

```ts
type DisciplineListQuery = {
  page?: number;
  pageSize?: number;
  cursoId?: string; // UUID
  nome?: string; // max 150
  cargaHoraria?: number; // inteiro entre 1 e 1000
  ativo?: boolean;
  sortBy?: 'nome' | 'cargaHoraria' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};
```

Resposta: `PaginatedResponse<Discipline>`.

### `GET /api/v1/disciplines/:id`

Resposta: `Discipline`.

### `PATCH /api/v1/disciplines/:id`

Body parcial:

```ts
type UpdateDisciplineBody = Partial<CreateDisciplineBody>;
```

Resposta: `Discipline`.

### `PATCH /api/v1/disciplines/:id/activate`

Resposta: `ActiveStatusResponse`.

### `PATCH /api/v1/disciplines/:id/deactivate`

Resposta: `ActiveStatusResponse`.

## Periodos letivos

Response:

```ts
type AcademicPeriod = {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### `POST /api/v1/academic-periods`

Status esperado: `201`.

Body:

```ts
type CreateAcademicPeriodBody = {
  nome: string; // max 50
  dataInicio: string; // data ISO ou YYYY-MM-DD
  dataFim: string; // data ISO ou YYYY-MM-DD
};
```

Resposta: `AcademicPeriod`.

### `GET /api/v1/academic-periods`

Query:

```ts
type AcademicPeriodListQuery = {
  page?: number;
  pageSize?: number;
  nome?: string; // max 50
  ativo?: boolean;
  sortBy?: 'nome' | 'dataInicio' | 'dataFim' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};
```

Resposta: `PaginatedResponse<AcademicPeriod>`.

### `GET /api/v1/academic-periods/:id`

Resposta: `AcademicPeriod`.

### `PATCH /api/v1/academic-periods/:id`

Body parcial:

```ts
type UpdateAcademicPeriodBody = Partial<CreateAcademicPeriodBody>;
```

Resposta: `AcademicPeriod`.

### `PATCH /api/v1/academic-periods/:id/activate`

Resposta: `ActiveStatusResponse`.

### `PATCH /api/v1/academic-periods/:id/deactivate`

Resposta: `ActiveStatusResponse`.

## Professores

Response:

```ts
type Professor = {
  id: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  pessoaInstitucional: InstitutionalPerson;
  unidadesAcademicas: AcademicUnit[];
};
```

### `POST /api/v1/professors`

Status esperado: `201`.

Body:

```ts
type CreateProfessorBody = {
  nome: string; // max 150
  nomeSocial?: string; // max 150
  emailInstitucional: string; // email, max 254
  matricula: string; // max 50
  unidadesAcademicasIds: string[]; // UUID[], minimo 1, max 10
};
```

Resposta: `Professor`.

### `GET /api/v1/professors`

Query:

```ts
type ProfessorListQuery = {
  page?: number;
  pageSize?: number;
  nome?: string; // max 150
  nomeSocial?: string; // max 150
  emailInstitucional?: string; // max 254
  matricula?: string; // max 50
  unidadeAcademicaId?: string; // UUID
  ativo?: boolean;
  sortBy?: 'nome' | 'nomeSocial' | 'emailInstitucional' | 'matricula' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};
```

Resposta: `PaginatedResponse<Professor>`.

### `GET /api/v1/professors/:id`

Resposta: `Professor`.

### `PATCH /api/v1/professors/:id`

Body parcial:

```ts
type UpdateProfessorBody = Partial<CreateProfessorBody>;
```

Observacao: se `unidadesAcademicasIds` for enviado no update, os vinculos de unidade academica do professor sao substituidos pela lista enviada.

Resposta: `Professor`.

### `PATCH /api/v1/professors/:id/activate`

Resposta: `ActiveStatusResponse`.

### `PATCH /api/v1/professors/:id/deactivate`

Resposta: `ActiveStatusResponse`.

## Turmas

Response:

```ts
type ClassGroup = {
  id: string;
  nome: string;
  sigla: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  disciplina: Discipline;
  periodoLetivo: AcademicPeriod;
};
```

### `POST /api/v1/class-groups`

Status esperado: `201`.

Body:

```ts
type CreateClassGroupBody = {
  disciplinaId: string; // UUID
  periodoLetivoId: string; // UUID
  nome: string; // max 150
  sigla: string; // max 30
};
```

Resposta: `ClassGroup`.

### `GET /api/v1/class-groups`

Query:

```ts
type ClassGroupListQuery = {
  page?: number;
  pageSize?: number;
  disciplinaId?: string; // UUID
  periodoLetivoId?: string; // UUID
  nome?: string; // max 150
  sigla?: string; // max 30
  ativo?: boolean;
  sortBy?: 'nome' | 'sigla' | 'disciplina' | 'periodoLetivo' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};
```

Resposta: `PaginatedResponse<ClassGroup>`.

### `GET /api/v1/class-groups/:id`

Resposta: `ClassGroup`.

### `PATCH /api/v1/class-groups/:id`

Body parcial:

```ts
type UpdateClassGroupBody = Partial<CreateClassGroupBody>;
```

Resposta: `ClassGroup`.

### `PATCH /api/v1/class-groups/:id/activate`

Resposta: `ActiveStatusResponse`.

### `PATCH /api/v1/class-groups/:id/deactivate`

Resposta: `ActiveStatusResponse`.

## Vinculos professor-turma

Response:

```ts
type ClassGroupProfessor = {
  id: string;
  createdAt: string;
  professor: {
    id: string;
    ativo: boolean;
    pessoaInstitucional: InstitutionalPerson;
  };
  turma: {
    id: string;
    nome: string;
    sigla: string;
    ativo: boolean;
    disciplina: {
      id: string;
      nome: string;
      cargaHoraria: number;
    };
    periodoLetivo: {
      id: string;
      nome: string;
      dataInicio: string;
      dataFim: string;
    };
  };
};
```

### `POST /api/v1/class-group-professors`

Status esperado: `201`.

Body:

```ts
type CreateClassGroupProfessorBody = {
  professorId: string; // UUID
  turmaId: string; // UUID
};
```

Regras adicionais:

- Nao vincula professor inativo.
- Nao vincula professor a turma inativa.
- O mesmo professor nao pode ser vinculado duas vezes a mesma turma.

Resposta: `ClassGroupProfessor`.

### `GET /api/v1/class-group-professors`

Query:

```ts
type ClassGroupProfessorListQuery = {
  page?: number;
  pageSize?: number;
  professorId?: string; // UUID
  turmaId?: string; // UUID
  sortBy?: 'createdAt' | 'professorNome' | 'turmaNome';
  sortDirection?: 'asc' | 'desc';
};
```

Resposta: `PaginatedResponse<ClassGroupProfessor>`.

### `GET /api/v1/class-group-professors/:id`

Resposta: `ClassGroupProfessor`.

### `DELETE /api/v1/class-group-professors/:id`

Resposta:

```ts
type ClassGroupProfessorDeleteResponse = DeleteResponse;
```

## Observacoes de frontend

- Para listas, sempre leia `response.data` e `response.meta`.
- Para filtros booleanos, envie `ativo=true` ou `ativo=false`.
- Para update parcial, envie somente campos alterados.
- Para contatos de estudante e unidades do professor, arrays enviados no `PATCH` substituem os valores atuais.
- Recursos com campo `ativo` usam endpoints dedicados de ativacao/desativacao, nao recebem `ativo` no `PATCH`.
