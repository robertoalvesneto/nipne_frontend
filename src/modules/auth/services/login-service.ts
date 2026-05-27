import { api } from "@/shared/services/api";
import type { JwtPayload } from "../interfaces/jwt-payload";

export interface LoginRequestApiDto {
    email: string;
    password: string;
}

export interface LoginResponseApiDto {
    accessToken: string;
    refreshToken: string;
    payload: JwtPayload;
}


function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createMockAuthResponse(): LoginResponseApiDto {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    UnidadeAcademicaId: "uea-ens-mock",
    UnidadeAcademicaNome: "Escola Normal Superior",
    UnidadeAcademicaSigla: "ENS",
    UnidadeAcademicaCategoria: "ESCOLA_SUPERIOR",
    nome: "Nome do Usuário",
    nomeSocial: null,
    emailInstitucional: "usuario@uea.edu.br",
    matricula: "0000000",
    perfil: "GESTOR",
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 24 * 7,
    sub: "usuario-mock",
  };
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const token = `${header}.${body}.mock-signature`;

  return {
    accessToken: token,
    refreshToken: token,
    payload,
  };
}

export const loginApi = async (data: LoginRequestApiDto) => {
  return new Promise<LoginResponseApiDto>((resolve) => {
    resolve(createMockAuthResponse());
  });
  
  const response = await api.post<LoginResponseApiDto>("/auth/login", data);
  return response.data;
};
