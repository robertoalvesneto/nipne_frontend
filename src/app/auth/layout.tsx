import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/shared/components/sidebar/sidebar";
import { ACCESS_TOKEN_KEY, PAYLOAD_KEY } from "@/modules/auth/services/auth-storage";
import { UserInfoCard } from "@/shared/components/user-info-card/user-info-card";
import { Card } from "@/shared/components/card/card";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload";
import { SidebarOptionsByPerfil } from "@/modules/usuario/constants/sidebar-options-by-perfil";
import CurrentOptionHeader from "@/shared/components/current-options-header/current-options-header";

import styles from "./layout.module.css";

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
  const payloadString = (await cookies()).get(PAYLOAD_KEY)?.value;
  const payload = payloadString ? JSON.parse(payloadString) as JwtPayload : null;

  if (!isAccessTokenValid(accessToken) || !payloadString || !payload) {
    redirect("/");
  }

  const options = SidebarOptionsByPerfil[payload?.perfil];

  return (
    <div className={styles.container}>
      <Sidebar
        mainOptions={options.main}
        sideOptions={options.side}
        logoAlt="..."
        logoSrc="/logo.svg"
      />
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <CurrentOptionHeader perfil={payload.perfil} />
          <UserInfoCard payload={payload} />
        </div>
        <Card className={styles.contentCard}>
          {children}
        </Card>
      </div>
    </div>
  );
}
