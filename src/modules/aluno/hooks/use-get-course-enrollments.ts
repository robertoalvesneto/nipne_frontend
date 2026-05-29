import { useQuery } from "@tanstack/react-query";
import {
  getCourseEnrollmentsApi,
  type CourseEnrollmentsListQueryApiDto,
  type CourseEnrollmentsListResponseApiDto,
} from "../services/get-course-enrollments-service";

export const COURSE_ENROLLMENTS_QUERY_KEY = ["course-enrollments"] as const;

export const courseEnrollmentsQueryKey = (
  query: CourseEnrollmentsListQueryApiDto = {},
) => [...COURSE_ENROLLMENTS_QUERY_KEY, query] as const;

export const useCourseEnrollments = (
  query: CourseEnrollmentsListQueryApiDto = {},
  enabled = true,
) => {
  return useQuery<CourseEnrollmentsListResponseApiDto, Error>({
    queryKey: courseEnrollmentsQueryKey(query),
    enabled,
    queryFn: async () => {
      const response = await getCourseEnrollmentsApi(query);
      return response;
    },
  });
};
