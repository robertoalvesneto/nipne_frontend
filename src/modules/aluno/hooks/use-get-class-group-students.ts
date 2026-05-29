import { useQuery } from "@tanstack/react-query";
import {
  getClassGroupStudentsApi,
  type ClassGroupStudentsListQueryApiDto,
  type ClassGroupStudentsListResponseApiDto,
} from "../services/get-class-group-students-service";

export const CLASS_GROUP_STUDENTS_QUERY_KEY = ["class-group-students"] as const;

export const classGroupStudentsQueryKey = (
  query: ClassGroupStudentsListQueryApiDto = {},
) => [...CLASS_GROUP_STUDENTS_QUERY_KEY, query] as const;

export const useClassGroupStudents = (
  query: ClassGroupStudentsListQueryApiDto = {},
  enabled = true,
) => {
  return useQuery<ClassGroupStudentsListResponseApiDto, Error>({
    queryKey: classGroupStudentsQueryKey(query),
    enabled,
    queryFn: async () => {
      const response = await getClassGroupStudentsApi(query);
      return response;
    },
  });
};
