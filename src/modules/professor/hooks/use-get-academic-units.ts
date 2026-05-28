import { useQuery } from "@tanstack/react-query";
import {
  getAcademicUnitsApi,
  type AcademicUnitsListQueryApiDto,
  type AcademicUnitsListResponseApiDto,
} from "../services/get-academic-units-service";

export const ACADEMIC_UNITS_QUERY_KEY = ["academic-units"] as const;

export const academicUnitsQueryKey = (
  query: AcademicUnitsListQueryApiDto = {},
) => [...ACADEMIC_UNITS_QUERY_KEY, query] as const;

export const useAcademicUnits = (query: AcademicUnitsListQueryApiDto = {}) => {
  return useQuery<AcademicUnitsListResponseApiDto, Error>({
    queryKey: academicUnitsQueryKey(query),
    queryFn: async () => {
      const response = await getAcademicUnitsApi(query);
      return response;
    },
  });
};
