"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Button, Drawer, IconButton, Switch } from "@mui/material";
import { formatDatePtBr } from "@/shared/utils/format-date";
import { permissoesByPerfil } from "../../constants/permissoes-by-perfil";
import type { Usuario } from "../../interfaces/usuario";
import { getUsuarioPerfil } from "../../utils/get-usuario-perfil";
import { roleLabelByPerfil } from "../../utils/perfil-role-label";
import styles from "./usuario-details-drawer.module.css";

export interface UsuarioDetailsDrawerProps {
  open: boolean;
  usuario?: Usuario | null;
  onClose: () => void;
  onEdit: (usuario: Usuario) => void;
}

export function UsuarioDetailsDrawer({
  open,
  usuario,
  onClose,
  onEdit,
}: UsuarioDetailsDrawerProps) {
  const perfil = usuario ? getUsuarioPerfil(usuario) : undefined;
  const statusAtivo = usuario?.ativo !== false;

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
      {usuario ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <GroupOutlinedIcon className={styles.titleIcon} />
              <h2>
                {usuario.name} <span>(ID: {usuario.id.slice(0, 8)})</span>
              </h2>
            </div>
            <IconButton aria-label="Fechar detalhes" onClick={onClose}>
              <ArrowForwardIcon />
            </IconButton>
          </div>

          <div className={styles.content}>
            <section className={styles.statusSection} aria-label="Status">
              <strong>Status</strong>
              <div className={styles.statusControl}>
                <Switch
                  color="success"
                  checked={statusAtivo}
                  readOnly
                  size="small"
                />
                <span>{statusAtivo ? "Ativo" : "Inativo"}</span>
              </div>
            </section>

            <dl className={styles.detailsGrid}>
              <div>
                <dt>Nome</dt>
                <dd>{usuario.name}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{usuario.email}</dd>
              </div>
              <div>
                <dt>Primeiro acesso</dt>
                <dd>{formatDatePtBr(usuario.createdAt) || "-"}</dd>
              </div>
              <div>
                <dt>Último acesso</dt>
                <dd>{formatDatePtBr(usuario.updatedAt) || "-"}</dd>
              </div>
              <div className={styles.fullRow}>
                <dt>Perfil</dt>
                <dd>{perfil ? roleLabelByPerfil[perfil] : "-"}</dd>
              </div>
            </dl>

            {perfil ? (
              <section className={styles.permissions}>
                <p>
                  Como {roleLabelByPerfil[perfil]}, este usuário pode acessar:
                </p>
                <ul>
                  {permissoesByPerfil[perfil].map((permission) => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <div className={styles.footer}>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => onEdit(usuario)}
            >
              Editar
            </Button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export default UsuarioDetailsDrawer;
