import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCourseEnrollmentApi,
  type CreateCourseEnrollmentBodyApiDto,
  type CreateCourseEnrollmentResponseApiDto,
} from "../services/create-course-enrollment-service";
import { STUDENTS_QUERY_KEY } from "./use-get-students";

export const useCreateCourseEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateCourseEnrollmentResponseApiDto,
    Error,
    CreateCourseEnrollmentBodyApiDto
  >({
    mutationFn: async (data) => {
      const response = await createCourseEnrollmentApi(data);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
};
