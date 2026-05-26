import { LoginRequestAppDto, LoginResponseAppDto } from "../dtos/login-app-dto";
import { LoginRequestApiDto, LoginResponseApiDto } from "../services/login-service";

export function mapLoginRequestAppToApi(dto: LoginRequestAppDto): LoginRequestApiDto {
    return { ...dto };
}

export function mapLoginResponseApiToApp(dto: LoginResponseApiDto): LoginResponseAppDto {
    return { ...dto };
}