import { useMutation } from "@tanstack/react-query";
import {
  mapLoginRequestAppToApi,
  mapLoginResponseApiToApp,
} from "../mappers/login-dto-mapper";
import { loginApi, LoginRequestApiDto, LoginResponseApiDto } from "../services/login-service";
import { setAuthTokens } from "@/modules/auth/services/auth-storage";

export const useLogin = () => {
  return useMutation<LoginResponseApiDto, Error, LoginRequestApiDto>({
    mutationFn: async (data) => {
      const response = await loginApi(mapLoginRequestAppToApi(data));
      return mapLoginResponseApiToApp(response);
    },
    onSuccess: (data) => {
      setAuthTokens(data);
    },
  });
};
