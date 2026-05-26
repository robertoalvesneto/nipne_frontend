import { useMutation } from "@tanstack/react-query";
import { LoginRequestAppDto, LoginResponseAppDto } from "../dtos/login-app-dto";
import {
  mapLoginRequestAppToApi,
  mapLoginResponseApiToApp,
} from "../mappers/login-dto-mapper";
import { loginApi } from "../services/login-service";
import { setAuthTokens } from "@/modules/auth/services/auth-storage";

export const useLogin = () => {
  return useMutation<LoginResponseAppDto, Error, LoginRequestAppDto>({
    mutationFn: async (data) => {
      const response = await loginApi(mapLoginRequestAppToApi(data));
      return mapLoginResponseApiToApp(response);
    },
    onSuccess: (data) => {
      setAuthTokens(data);
    },
  });
};
