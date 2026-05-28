import { useQuery } from "@tanstack/react-query";
import {
  getCoursesApi,
  type CoursesListQueryApiDto,
  type CoursesListResponseApiDto,
} from "../services/get-courses-service";

export const COURSES_QUERY_KEY = ["courses"] as const;

export const coursesQueryKey = (query: CoursesListQueryApiDto = {}) =>
  [...COURSES_QUERY_KEY, query] as const;

export const useCourses = (query: CoursesListQueryApiDto = {}) => {
  return useQuery<CoursesListResponseApiDto, Error>({
    queryKey: coursesQueryKey(query),
    queryFn: async () => {
      const response = await getCoursesApi(query);
      return response;
    },
  });
};
