import { useQuery } from "@tanstack/react-query";
import {
  getEscutasApi,
  type EscutasListQueryApiDto,
  type EscutasListResponseApiDto,
} from "../services/get-escutas-service";

export const ESCUTAS_QUERY_KEY = ["escutas"] as const;

export const escutasQueryKey = (query: EscutasListQueryApiDto = {}) =>
  [...ESCUTAS_QUERY_KEY, query] as const;

export const useEscutas = (query: EscutasListQueryApiDto = {}, enabled = true) => {
  return useQuery<EscutasListResponseApiDto, Error>({
    queryKey: escutasQueryKey(query),
    enabled,
    queryFn: async () => {
      const response = await getEscutasApi(query);
      return response;
    },
  });
};
