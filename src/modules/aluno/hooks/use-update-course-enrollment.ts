import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCourseEnrollmentApi,
  type UpdateCourseEnrollmentBodyApiDto,
  type UpdateCourseEnrollmentResponseApiDto,
} from "../services/update-course-enrollment-service";
import { COURSE_ENROLLMENTS_QUERY_KEY } from "./use-get-course-enrollments";
import { STUDENTS_QUERY_KEY } from "./use-get-students";

export interface UpdateCourseEnrollmentMutationVariables {
  id: string;
  data: UpdateCourseEnrollmentBodyApiDto;
}

export const useUpdateCourseEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCourseEnrollmentResponseApiDto,
    Error,
    UpdateCourseEnrollmentMutationVariables
  >({
    mutationFn: async ({ id, data }) => {
      const response = await updateCourseEnrollmentApi(id, data);
      return response;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: COURSE_ENROLLMENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY }),
      ]);
    },
  });
};
