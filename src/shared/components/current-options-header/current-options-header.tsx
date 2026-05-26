"use client";

import { usePathname } from "next/navigation";

import { SidebarOptionsByPerfil } from "@/modules/usuario/constants/sidebar-options-by-perfil";
import { PerfilUsuario } from "@/modules/usuario/types/perfil-usuario";
import { ContentHeader } from "../content-header/content-header";

interface CurrentOptionHeaderProps {
  perfil: PerfilUsuario;
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, "").toLowerCase();
}

function isSameOrNestedPath(currentPath: string, optionPath: string) {
  if (optionPath === "/") {
    return currentPath === optionPath;
  }

  return currentPath === optionPath || currentPath.startsWith(`${optionPath}/`);
}

export function CurrentOptionHeader({ perfil }: CurrentOptionHeaderProps) {
  const pathname = usePathname();
  const optionsByPerfil = SidebarOptionsByPerfil[perfil];
  const allOptions = [...optionsByPerfil.main, ...optionsByPerfil.side];

  const currentPath = normalizePath(pathname);

  const currentOption = allOptions.find((option) => {
    const optionPath = normalizePath(option.path);

    return isSameOrNestedPath(currentPath, optionPath);
  });

  return <ContentHeader title={currentOption?.name ?? "Painel"} icon={currentOption?.icon} />;
}

export default CurrentOptionHeader;
