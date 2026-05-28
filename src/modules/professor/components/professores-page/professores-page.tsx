"use client";

import { useMemo, useState } from "react";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAcademicUnits } from "../../hooks/use-get-academic-units";
import { useCreateProfessor } from "../../hooks/use-create-professor";
import { useUpdateProfessor } from "../../hooks/use-update-professor";
import { useUpdateProfessorStatus } from "../../hooks/use-update-professor-status";
import type { Professor } from "../../interfaces/professor";
import type { ProfessoresListQueryApiDto } from "../../services/get-professores-service";
import { ProfessorDetailsDrawer } from "../professor-details-drawer/professor-details-drawer";
import { ProfessorFormDrawer } from "../professor-form-drawer/professor-form-drawer";
import type { ProfessorFormSubmitValues } from "../professor-form/professor-form";
import { ProfessoresTable } from "../professores-table/professores-table";
import styles from "./professores-page.module.css";

type StatusFilter = "todos" | "ativos" | "inativos";

export function ProfessoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [unitFilter, setUnitFilter] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const academicUnitsQuery = useAcademicUnits();
  const createProfessorMutation = useCreateProfessor();
  const updateProfessorMutation = useUpdateProfessor();
  const updateProfessorStatusMutation = useUpdateProfessorStatus();

  const filters = useMemo<ProfessoresListQueryApiDto>(
    () => ({
      page: 1,
      pageSize: 10,
      ...(unitFilter ? { unidadeAcademicaId: unitFilter } : {}),
      ...(statusFilter === "ativos" ? { ativo: true } : {}),
      ...(statusFilter === "inativos" ? { ativo: false } : {}),
    }),
    [statusFilter, unitFilter],
  );

  const isSubmitting =
    createProfessorMutation.isPending ||
    updateProfessorMutation.isPending ||
    updateProfessorStatusMutation.isPending;

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as StatusFilter);
  };

  const handleUnitChange = (event: SelectChangeEvent) => {
    setUnitFilter(event.target.value);
  };

  const openCreateForm = () => {
    setSelectedProfessor(null);
    setFormError(undefined);
    setFormMode("create");
  };

  const openDetails = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsDetailsOpen(true);
  };

  const openEditForm = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsDetailsOpen(false);
    setFormError(undefined);
    setFormMode("edit");
  };

  const closeForm = () => {
    if (isSubmitting) {
      return;
    }

    setFormMode(null);
    setFormError(undefined);
  };

  const handleSubmitProfessor = async (values: ProfessorFormSubmitValues) => {
    setFormError(undefined);

    try {
      if (formMode === "create") {
        await createProfessorMutation.mutateAsync({
          nome: values.nome,
          ...(values.nomeSocial ? { nomeSocial: values.nomeSocial } : {}),
          emailInstitucional: values.emailInstitucional,
          matricula: values.matricula,
          unidadesAcademicasIds: values.unidadesAcademicasIds,
        });
        toast.success("Professor adicionado com sucesso.");
      }

      if (formMode === "edit" && selectedProfessor) {
        await updateProfessorMutation.mutateAsync({
          id: selectedProfessor.id,
          data: {
            nome: values.nome,
            nomeSocial: values.nomeSocial ?? "",
            emailInstitucional: values.emailInstitucional,
            matricula: values.matricula,
            unidadesAcademicasIds: values.unidadesAcademicasIds,
          },
        });

        if (
          values.ativo !== undefined &&
          values.ativo !== selectedProfessor.ativo
        ) {
          await updateProfessorStatusMutation.mutateAsync({
            id: selectedProfessor.id,
            ativo: values.ativo,
          });
        }

        toast.success("Professor atualizado com sucesso.");
      }

      setFormMode(null);
      setSelectedProfessor(null);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o professor.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <TextField
            className={styles.searchField}
            label="Buscar professor"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome, e-mail ou matrícula"
            size="small"
            value={searchTerm}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl className={styles.unitField} size="small">
            <InputLabel id="professor-unit-filter-label">
              Unidade acadêmica
            </InputLabel>
            <Select
              labelId="professor-unit-filter-label"
              label="Unidade acadêmica"
              value={unitFilter}
              onChange={handleUnitChange}
            >
              <MenuItem value="">Todas as unidades</MenuItem>
              {(academicUnitsQuery.data?.data ?? []).map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.sigla} - {unit.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={styles.statusField} size="small">
            <InputLabel id="professor-status-filter-label">Status</InputLabel>
            <Select
              labelId="professor-status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativos">Ativos</MenuItem>
              <MenuItem value="inativos">Inativos</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button
          className={styles.addButton}
          variant="contained"
          startIcon={<AddCircleOutlinedIcon />}
          onClick={openCreateForm}
        >
          Adicionar Novo
        </Button>
      </div>

      <ProfessoresTable
        filters={filters}
        searchTerm={searchTerm}
        onViewProfessor={openDetails}
        onEditProfessor={openEditForm}
      />

      <ProfessorDetailsDrawer
        open={isDetailsOpen}
        professor={selectedProfessor}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={openEditForm}
      />

      <ProfessorFormDrawer
        open={Boolean(formMode)}
        mode={formMode ?? "create"}
        professor={selectedProfessor}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onClose={closeForm}
        onSubmit={handleSubmitProfessor}
      />
    </div>
  );
}

export default ProfessoresPage;
