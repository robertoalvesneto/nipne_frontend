"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import {
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
} from "@mui/material";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useClassGroups } from "@/modules/disciplina/hooks/use-get-class-groups";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { formatRegistration } from "@/shared/utils/registration";
import { useCreateClassGroupStudent } from "../../hooks/use-create-class-group-student";
import { useDeleteClassGroupStudent } from "../../hooks/use-delete-class-group-student";
import { useClassGroupStudents } from "../../hooks/use-get-class-group-students";
import { useStudent } from "../../hooks/use-get-student";
import type { StudentListItem } from "../../interfaces/student";
import styles from "./aluno-details-drawer.module.css";

export interface AlunoDetailsDrawerProps {
  open: boolean;
  aluno?: StudentListItem | null;
  onClose: () => void;
  onEdit?: (aluno: StudentListItem) => void;
}

function getAlunoNome(aluno: StudentListItem) {
  return (
    aluno.pessoaInstitucional.nomeSocial?.trim() ||
    aluno.pessoaInstitucional.nome
  );
}

function getProfessoresText(
  professores: Array<{
    pessoaInstitucional: {
      nome: string;
      nomeSocial?: string | null;
    };
  }>,
) {
  return (
    professores
      .map(
        (professor) =>
          professor.pessoaInstitucional.nomeSocial?.trim() ||
          professor.pessoaInstitucional.nome,
      )
      .join(", ") || "-"
  );
}

export function AlunoDetailsDrawer({
  open,
  aluno,
  onClose,
  onEdit,
}: AlunoDetailsDrawerProps) {
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const alunoId = aluno?.id;
  const alunoCursoAtualId = aluno?.cursoAtual?.id;
  const studentQuery = useStudent(open ? alunoId : undefined);
  const studentClassGroupsQueryParams = useMemo(
    () => ({
      page: 1,
      pageSize: 100,
      ...(alunoId ? { estudanteId: alunoId } : {}),
    }),
    [alunoId],
  );
  const classGroupsQueryParams = useMemo(
    () => ({
      page: 1,
      pageSize: 100,
      ativo: true,
      sortBy: "disciplina" as const,
      sortDirection: "asc" as const,
      ...(alunoCursoAtualId ? { cursoId: alunoCursoAtualId } : {}),
    }),
    [alunoCursoAtualId],
  );
  const studentClassGroupsQuery = useClassGroupStudents(
    studentClassGroupsQueryParams,
    open && Boolean(alunoId),
  );
  const classGroupsQuery = useClassGroups(
    classGroupsQueryParams,
    open && Boolean(alunoCursoAtualId),
  );
  const createClassGroupStudentMutation = useCreateClassGroupStudent();
  const deleteClassGroupStudentMutation = useDeleteClassGroupStudent();
  const details = studentQuery.data;
  const telefonePreferencial =
    details?.contatosTelefonicos.find(
      (contact) => contact.formaPreferencialContato,
    ) ?? details?.contatosTelefonicos[0];
  const contatoApoio = details?.contatosApoio[0];
  const rawLinkedClassGroups = studentClassGroupsQuery.data?.data;
  const linkedClassGroups = useMemo(
    () => rawLinkedClassGroups ?? [],
    [rawLinkedClassGroups],
  );
  const linkedClassGroupIds = useMemo(
    () => new Set(linkedClassGroups.map((link) => link.turma.id)),
    [linkedClassGroups],
  );
  const rawClassGroups = classGroupsQuery.data?.data;
  const availableClassGroups = useMemo(
    () =>
      (rawClassGroups ?? []).filter(
        (classGroup) => !linkedClassGroupIds.has(classGroup.id),
      ),
    [linkedClassGroupIds, rawClassGroups],
  );
  const isSelectedClassGroupAvailable = availableClassGroups.some(
    (classGroup) => classGroup.id === selectedClassGroupId,
  );
  const isDisciplineActionPending =
    createClassGroupStudentMutation.isPending ||
    deleteClassGroupStudentMutation.isPending;

  const handleClassGroupChange = (event: SelectChangeEvent) => {
    setSelectedClassGroupId(event.target.value);
  };

  const handleAddClassGroup = async () => {
    if (!aluno || !selectedClassGroupId) {
      return;
    }

    if (!isSelectedClassGroupAvailable) {
      setSelectedClassGroupId("");
      return;
    }

    try {
      await createClassGroupStudentMutation.mutateAsync({
        estudanteId: aluno.id,
        turmaId: selectedClassGroupId,
      });
      setSelectedClassGroupId("");
      toast.success("Disciplina adicionada ao aluno.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar a disciplina.",
      );
    }
  };

  const handleRemoveClassGroup = async (linkId: string) => {
    try {
      await deleteClassGroupStudentMutation.mutateAsync(linkId);
      toast.success("Disciplina removida do aluno.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível remover a disciplina.",
      );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: styles.drawer,
        },
      }}
    >
      {aluno ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <SchoolOutlinedIcon className={styles.titleIcon} />
              <h2>
                {getAlunoNome(aluno)} <span>(ID: {aluno.id.slice(0, 8)})</span>
              </h2>
            </div>
            <div className={styles.headerActions}>
              {onEdit ? (
                <Button
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => onEdit(aluno)}
                >
                  Editar
                </Button>
              ) : null}
              <IconButton aria-label="Fechar detalhes" onClick={onClose}>
                <ArrowForwardIcon />
              </IconButton>
            </div>
          </div>

          <div className={styles.tabs} aria-label="Seções do aluno">
            <span className={styles.activeTab}>Dados Gerais</span>
          </div>

          <div className={styles.content}>
            <section className={styles.statusSection} aria-label="Status">
              <strong>Status</strong>
              <div className={styles.statusControl}>
                <Switch
                  color="success"
                  checked={aluno.ativo}
                  readOnly
                  size="small"
                />
                <span>{aluno.ativo ? "Ativo" : "Inativo"}</span>
              </div>
            </section>

            <dl className={styles.detailsGrid}>
              <div>
                <dt>Nome</dt>
                <dd>
                  {details?.pessoaInstitucional.nome ??
                    aluno.pessoaInstitucional.nome}
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{aluno.pessoaInstitucional.emailInstitucional}</dd>
              </div>
              <div>
                <dt>Curso</dt>
                <dd>{aluno.cursoAtual?.nome ?? "-"}</dd>
              </div>
              <div>
                <dt>Unidade acadêmica</dt>
                <dd>
                  {aluno.unidadeAcademica.sigla} - {aluno.unidadeAcademica.nome}
                </dd>
              </div>
              <div>
                <dt>Matrícula</dt>
                <dd>
                  {formatRegistration(
                    aluno.cursoAtual?.matricula,
                    aluno.pessoaInstitucional.matricula,
                  )}
                </dd>
              </div>
              <div>
                <dt>Data de nascimento</dt>
                <dd>
                  {formatDatePtBr(
                    details?.dataNascimento ?? aluno.dataNascimento,
                  ) || "-"}
                </dd>
              </div>
              <div>
                <dt>Contato (WhatsApp)</dt>
                <dd>{telefonePreferencial?.telefone ?? "-"}</dd>
              </div>
              <div>
                <dt>Contato de apoio</dt>
                <dd>
                  {contatoApoio
                    ? `${contatoApoio.nome} - ${contatoApoio.telefone}`
                    : "-"}
                </dd>
              </div>
            </dl>

            {studentQuery.isLoading ? (
              <p className={styles.loadingText}>Carregando detalhes...</p>
            ) : null}

            <section className={styles.disciplinesSection}>
              <div className={styles.sectionHeader}>
                <strong>Disciplinas</strong>
                <span>{linkedClassGroups.length} vinculada(s)</span>
              </div>

              {aluno.cursoAtual ? (
                <div className={styles.addDisciplineRow}>
                  <FormControl className={styles.disciplineSelect} size="small">
                    <InputLabel id="student-class-group-label">
                      Disciplina
                    </InputLabel>
                    <Select
                      labelId="student-class-group-label"
                      label="Disciplina"
                      value={selectedClassGroupId}
                      onChange={handleClassGroupChange}
                      disabled={
                        isDisciplineActionPending ||
                        classGroupsQuery.isLoading ||
                        availableClassGroups.length === 0
                      }
                    >
                      <MenuItem value="" disabled>
                        Selecione uma disciplina
                      </MenuItem>
                      {availableClassGroups.map((classGroup) => (
                        <MenuItem key={classGroup.id} value={classGroup.id}>
                          {classGroup.disciplina.nome} - {classGroup.sigla}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleAddClassGroup}
                    disabled={
                      !isSelectedClassGroupAvailable ||
                      isDisciplineActionPending
                    }
                  >
                    Adicionar
                  </Button>
                </div>
              ) : (
                <p className={styles.emptyText}>
                  Vincule um curso ao aluno para adicionar disciplinas.
                </p>
              )}

              {studentClassGroupsQuery.isLoading ? (
                <p className={styles.loadingText}>Carregando disciplinas...</p>
              ) : null}

              {linkedClassGroups.length > 0 ? (
                <div className={styles.disciplineList}>
                  {linkedClassGroups.map((link) => (
                    <article className={styles.disciplineItem} key={link.id}>
                      <div>
                        <strong>{link.turma.disciplina.nome}</strong>
                        <span>
                          {link.turma.sigla} ·{" "}
                          {link.turma.periodoLetivo.nome}
                        </span>
                        <small>{getProfessoresText(link.turma.professores)}</small>
                      </div>
                      <IconButton
                        aria-label={`Remover ${link.turma.disciplina.nome}`}
                        color="error"
                        disabled={isDisciplineActionPending}
                        onClick={() => handleRemoveClassGroup(link.id)}
                        size="small"
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </article>
                  ))}
                </div>
              ) : !studentClassGroupsQuery.isLoading ? (
                <p className={styles.emptyText}>
                  Nenhuma disciplina vinculada ao aluno.
                </p>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export default AlunoDetailsDrawer;
