import { useQuery } from "@tanstack/react-query";
import {
  getDisciplinasApi,
  type DisciplinasListQueryApiDto,
  type DisciplinasListResponseApiDto,
} from "../services/get-disciplinas-service";

export const DISCIPLINES_QUERY_KEY = ["disciplines"] as const;

export const disciplinasQueryKey = (query: DisciplinasListQueryApiDto = {}) =>
  [...DISCIPLINES_QUERY_KEY, query] as const;

export const useDisciplinas = (query: DisciplinasListQueryApiDto = {}) => {
  return useQuery<DisciplinasListResponseApiDto, Error>({
    queryKey: disciplinasQueryKey(query),
    queryFn: async () => {
      const response = await getDisciplinasApi(query);
      return response;
    },
  });
};
