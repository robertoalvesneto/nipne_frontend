export interface LoginRequestAppDto {
    email: string;
    password: string;
}

export interface LoginResponseAppDto {
    accessToken: string;
    refreshToken: string;
}