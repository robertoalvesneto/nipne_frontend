import type { Usuario } from "../interfaces/usuario";

export function getUsuarioPerfil(usuario: Usuario) {
  return usuario.profile ?? usuario.perfil;
}
