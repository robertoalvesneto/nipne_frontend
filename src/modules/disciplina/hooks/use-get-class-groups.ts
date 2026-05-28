import { useQuery } from "@tanstack/react-query";
import {
  getClassGroupsApi,
  type ClassGroupsListQueryApiDto,
  type ClassGroupsListResponseApiDto,
} from "../services/get-class-groups-service";

export const CLASS_GROUPS_QUERY_KEY = ["class-groups"] as const;

export const classGroupsQueryKey = (
  query: ClassGroupsListQueryApiDto = {},
) => [...CLASS_GROUPS_QUERY_KEY, query] as const;

export const useClassGroups = (query: ClassGroupsListQueryApiDto = {}) => {
  return useQuery<ClassGroupsListResponseApiDto, Error>({
    queryKey: classGroupsQueryKey(query),
    queryFn: async () => {
      const response = await getClassGroupsApi(query);
      return response;
    },
  });
};
