import { api } from "../../../shared/services/api";
import {
  clearAuthTokens,
  getAuthTokens,
  isAccessTokenValid,
  setAuthTokens,
} from "../services/auth-storage";

export { getAuthTokens, setAuthTokens };

export function isLoggedIn() {
  return isAccessTokenValid();
}

export function logout() {
  clearAuthTokens();
  delete api.defaults.headers.common.Authorization;
}
