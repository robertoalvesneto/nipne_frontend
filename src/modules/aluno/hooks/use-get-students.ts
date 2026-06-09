import { useQuery } from "@tanstack/react-query";
import {
  getStudentsApi,
  type StudentsListQueryApiDto,
  type StudentsListResponseApiDto,
} from "../services/get-students-service";

export const STUDENTS_QUERY_KEY = ["students"] as const;

export const studentsQueryKey = (query: StudentsListQueryApiDto = {}) =>
  [...STUDENTS_QUERY_KEY, query] as const;

export const useStudents = (query: StudentsListQueryApiDto = {}, enabled = true) => {
  return useQuery<StudentsListResponseApiDto, Error>({
    queryKey: studentsQueryKey(query),
    enabled,
    queryFn: async () => {
      const response = await getStudentsApi(query);
      return response;
    },
  });
};
