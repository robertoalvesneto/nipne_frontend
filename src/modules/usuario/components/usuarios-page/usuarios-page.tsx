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
import { perfilUsuarioOptions } from "../../constants/perfil-usuario-options";
import { useCreateUser } from "../../hooks/use-create-usuario";
import { useUpdateUser } from "../../hooks/use-update-usuario";
import type { Usuario } from "../../interfaces/usuario";
import type { UsuariosListQueryApiDto } from "../../services/get-usuario-service";
import type { PerfilUsuario } from "../../types/perfil-usuario";
import { UsuarioDetailsDrawer } from "../usuario-details-drawer/usuario-details-drawer";
import { UsuarioFormDrawer } from "../usuario-form-drawer/usuario-form-drawer";
import type { UsuarioFormSubmitValues } from "../usuario-form/usuario-form";
import { UsuariosTable } from "../usuarios-table/usuarios-table";
import styles from "./usuarios-page.module.css";

export function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [profileFilter, setProfileFilter] = useState<PerfilUsuario | "">("");
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const filters = useMemo<UsuariosListQueryApiDto>(
    () => ({
      page: 1,
      pageSize: 10,
      ...(profileFilter ? { profile: profileFilter } : {}),
    }),
    [profileFilter],
  );

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;

  const handleProfileChange = (event: SelectChangeEvent) => {
    setProfileFilter(event.target.value as PerfilUsuario | "");
  };

  const openCreateForm = () => {
    setSelectedUsuario(null);
    setFormError(undefined);
    setFormMode("create");
  };

  const openDetails = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsDetailsOpen(true);
  };

  const openEditForm = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
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

  const handleSubmitUsuario = async (values: UsuarioFormSubmitValues) => {
    setFormError(undefined);

    try {
      if (formMode === "create") {
        if (!values.password) {
          setFormError("Informe uma senha para adicionar o usuário.");
          return;
        }

        await createUserMutation.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          profile: values.profile,
        });
        toast.success("Usuário adicionado com sucesso.");
      }

      if (formMode === "edit" && selectedUsuario) {
        await updateUserMutation.mutateAsync({
          id: selectedUsuario.id,
          data: {
            name: values.name,
            email: values.email,
            profile: values.profile,
            ativo: values.ativo ?? true,
            ...(values.password ? { password: values.password } : {}),
          },
        });
        toast.success("Usuário atualizado com sucesso.");
      }

      setFormMode(null);
      setSelectedUsuario(null);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o usuário.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <TextField
            className={styles.searchField}
            label="Buscar usuário"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome ou e-mail"
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

          <FormControl className={styles.profileField} size="small">
            <InputLabel id="profile-filter-label">Perfil</InputLabel>
            <Select
              labelId="profile-filter-label"
              label="Perfil"
              value={profileFilter}
              onChange={handleProfileChange}
            >
              <MenuItem value="">Todos os perfis</MenuItem>
              {perfilUsuarioOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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

      <UsuariosTable
        filters={filters}
        searchTerm={searchTerm}
        onViewUsuario={openDetails}
        onEditUsuario={openEditForm}
      />

      <UsuarioDetailsDrawer
        open={isDetailsOpen}
        usuario={selectedUsuario}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={openEditForm}
      />

      <UsuarioFormDrawer
        open={Boolean(formMode)}
        mode={formMode ?? "create"}
        usuario={selectedUsuario}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onClose={closeForm}
        onSubmit={handleSubmitUsuario}
      />
    </div>
  );
}

export default UsuariosPage;
