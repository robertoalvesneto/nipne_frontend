import { useQuery } from "@tanstack/react-query";
import {
  getUsuariosApi,
  UsuariosListQueryApiDto,
  UsuariosListResponseApiDto,
} from "../services/get-usuario-service";

export const USERS_QUERY_KEY = ["users"] as const;
export const usersQueryKey = (query: UsuariosListQueryApiDto = {}) =>
  [...USERS_QUERY_KEY, query] as const;

export const useUsers = (query: UsuariosListQueryApiDto = {}) => {
  return useQuery<UsuariosListResponseApiDto, Error>({
    queryKey: usersQueryKey(query),
    queryFn: async () => {
      const response = await getUsuariosApi(query);
      return response;
    },
  });
};
