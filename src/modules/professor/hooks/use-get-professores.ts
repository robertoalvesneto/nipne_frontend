import { useQuery } from "@tanstack/react-query";
import {
  getProfessoresApi,
  type ProfessoresListQueryApiDto,
  type ProfessoresListResponseApiDto,
} from "../services/get-professores-service";

export const PROFESSORS_QUERY_KEY = ["professors"] as const;

export const professorsQueryKey = (query: ProfessoresListQueryApiDto = {}) =>
  [...PROFESSORS_QUERY_KEY, query] as const;

export const useProfessores = (query: ProfessoresListQueryApiDto = {}) => {
  return useQuery<ProfessoresListResponseApiDto, Error>({
    queryKey: professorsQueryKey(query),
    queryFn: async () => {
      const response = await getProfessoresApi(query);
      return response;
    },
  });
};
