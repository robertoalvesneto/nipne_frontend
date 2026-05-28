import { useQuery } from "@tanstack/react-query";
import {
  getAcademicPeriodsApi,
  type AcademicPeriodsListQueryApiDto,
  type AcademicPeriodsListResponseApiDto,
} from "../services/get-academic-periods-service";

export const ACADEMIC_PERIODS_QUERY_KEY = ["academic-periods"] as const;

export const academicPeriodsQueryKey = (
  query: AcademicPeriodsListQueryApiDto = {},
) => [...ACADEMIC_PERIODS_QUERY_KEY, query] as const;

export const useAcademicPeriods = (
  query: AcademicPeriodsListQueryApiDto = {},
) => {
  return useQuery<AcademicPeriodsListResponseApiDto, Error>({
    queryKey: academicPeriodsQueryKey(query),
    queryFn: async () => {
      const response = await getAcademicPeriodsApi(query);
      return response;
    },
  });
};
