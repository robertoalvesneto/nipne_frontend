import { PerfilUsuario } from "../types/perfil-usuario";

export interface Usuario {
  id: string;
  perfil?: PerfilUsuario;
  profile?: PerfilUsuario;
  name: string;
  email: string;
  password?: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
