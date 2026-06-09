import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  scheduleEscutaApi,
  type ScheduleEscutaRequestApiDto,
  type ScheduleEscutaResponseApiDto,
} from "../services/schedule-escuta-service";
import { ESCUTAS_QUERY_KEY } from "./use-get-escutas";

export const useScheduleEscuta = () => {
  const queryClient = useQueryClient();

  return useMutation<ScheduleEscutaResponseApiDto, Error, ScheduleEscutaRequestApiDto>({
    mutationFn: async (request) => {
      const response = await scheduleEscutaApi(request);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ESCUTAS_QUERY_KEY });
    },
  });
};
