"use client";

import { useEffect, type ReactNode } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { Table, type TableColumn } from "@/shared/components/table/table";
import type { PaginatedResponseMeta } from "@/shared/types/paginated-response-type";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useUsers } from "../../hooks/use-get-usuarios";
import type { UsuariosListQueryApiDto } from "../../services/get-usuario-service";
import styles from "./usuarios-table.module.css";
import { Usuario } from "../../interfaces/usuario";
import { roleLabelByPerfil } from "../../utils/perfil-role-label";
import { getUsuarioPerfil } from "../../utils/get-usuario-perfil";

export interface UsuariosTableProps {
  filters?: UsuariosListQueryApiDto;
  searchTerm?: string;
  actionLabel?: ReactNode;
  renderAction?: (usuario: Usuario) => ReactNode;
  onActionClick?: (usuario: Usuario) => void;
  onMetaChange?: (meta?: PaginatedResponseMeta) => void;
  onViewUsuario?: (usuario: Usuario) => void;
  onEditUsuario?: (usuario: Usuario) => void;
}

type UsuarioTableRow = Usuario & {
  onUsuarioClick?: (usuario: Usuario) => void;
};

const columns: TableColumn<UsuarioTableRow>[] = [
  {
    key: "id",
    header: "ID",
    width: "12%",
    render: (usuario) => (
      <span className={styles.idText}>{usuario.id.slice(0, 8)}</span>
    ),
  },
  {
    key: "name",
    header: "Nome",
    width: "22%",
    render: (usuario) =>
      usuario.onUsuarioClick ? (
        <button
          className={styles.userButton}
          type="button"
          onClick={() => usuario.onUsuarioClick?.(usuario)}
        >
          {usuario.name}
        </button>
      ) : (
        <span className={styles.userText}>{usuario.name}</span>
      ),
  },
  {
    key: "email",
    header: "E-mail",
    width: "25%",
  },
  {
    key: "perfil",
    header: "Perfil",
    width: "14%",
    render: (usuario) => {
      const perfil = getUsuarioPerfil(usuario);

      return perfil ? roleLabelByPerfil[perfil] : "";
    },
  },
  {
    key: "createdAt",
    header: "Primeiro acesso",
    width: "14%",
    render: (usuario) => formatDatePtBr(usuario.createdAt),
  },
  {
    key: "updatedAt",
    header: "Último acesso",
    width: "14%",
    render: (usuario) => formatDatePtBr(usuario.updatedAt),
  },
  {
    key: "ativo",
    header: "Status",
    width: "10%",
    render: (usuario) => (
      <span
        className={
          usuario.ativo === false ? styles.inactiveStatus : styles.activeStatus
        }
      >
        {usuario.ativo === false ? "Inativo" : "Ativo"}
      </span>
    ),
  },
];

export function UsuariosTable({
  filters = {},
  searchTerm = "",
  actionLabel = "Ver",
  renderAction,
  onActionClick,
  onMetaChange,
  onViewUsuario,
  onEditUsuario,
}: UsuariosTableProps) {
  const usuariosQuery = useUsers(filters);
  const usuarios = usuariosQuery.data?.data ?? [];
  const normalizedSearchTerm = normalizeText(searchTerm);

  useEffect(() => {
    onMetaChange?.(usuariosQuery.data?.meta);
  }, [onMetaChange, usuariosQuery.data?.meta]);

  const rows: UsuarioTableRow[] = usuarios
    .filter((usuario) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      return normalizeText(`${usuario.name} ${usuario.email}`).includes(
        normalizedSearchTerm,
      );
    })
    .map((usuario) => ({
      ...usuario,
      onUsuarioClick: onViewUsuario,
    }));

  return (
    <Table
      ariaLabel="Tabela de usuários"
      columns={columns}
      data={rows}
      emptyMessage={
        searchTerm
          ? "Nenhum usuário encontrado para o filtro informado."
          : "Nenhum usuário encontrado."
      }
      getRowKey={(usuario) => usuario.id}
      isLoading={usuariosQuery.isLoading}
      loadingMessage="Carregando usuários..."
      actions={
        renderAction || onActionClick || onViewUsuario || onEditUsuario
          ? (usuario) =>
              renderAction ? (
                renderAction(usuario)
              ) : onViewUsuario || onEditUsuario ? (
                <div className={styles.actionGroup}>
                  {onViewUsuario ? (
                    <Tooltip title="Visualizar usuário">
                      <IconButton
                        aria-label={`Visualizar ${usuario.name}`}
                        className={styles.iconButton}
                        onClick={() => onViewUsuario(usuario)}
                        size="small"
                        type="button"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  {onEditUsuario ? (
                    <Tooltip title="Editar usuário">
                      <IconButton
                        aria-label={`Editar ${usuario.name}`}
                        className={styles.iconButton}
                        onClick={() => onEditUsuario(usuario)}
                        size="small"
                        type="button"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </div>
              ) : (
                <button
                  className={styles.actionButton}
                  type="button"
                  onClick={() => onActionClick?.(usuario)}
                >
                  {actionLabel}
                </button>
              )
          : undefined
      }
    />
  );
}

export default UsuariosTable;
