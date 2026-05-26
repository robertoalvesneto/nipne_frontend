import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACCESS_TOKEN_KEY = "nipne_access_token";

function isAccessTokenValid(accessToken: string | undefined) {
  if (!accessToken) {
    return false;
  }

  const jwtParts = accessToken.split(".");

  if (jwtParts.length !== 3) {
    return true;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(jwtParts[1], "base64url").toString("utf8")
    );

    if (typeof payload.exp !== "number") {
      return true;
    }

    return payload.exp * 1000 > Date.now();
  } catch {
    return true;
  }
}

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_KEY)?.value;

  if (!isAccessTokenValid(accessToken)) {
    redirect("/");
  }

  return children;
}
