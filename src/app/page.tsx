"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Container, TextField, Typography, useTheme } from "@mui/material";
import CardContent from '@mui/material/CardContent';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "@/modules/auth/hooks/use-login";
import { useLoginSchema, type UseLoginSchema } from "@/modules/auth/schemas/use-login-schema";
import { Card } from "@/shared/components/card/card";

import styles from './page.module.css';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const loginMutation = useLogin();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UseLoginSchema>({
    resolver: zodResolver(useLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (loginMutation.isSuccess) {
      router.refresh();
    }
  }, [loginMutation.isSuccess, router]);

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return (
    <Container className={styles.container} maxWidth="sm">
      <Card>
        <CardContent>
          <Image className={styles.logo} src="/logo.svg" alt="Logo" width={100} height={100} />
          <Box component="form" onSubmit={onSubmit} className={styles.form}>
            <Typography variant="h4" component="h1" color={theme.palette.primary.main} gutterBottom>
              NIPNE
            </Typography>

            <TextField
              label="E-mail"
              type="email"
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email")}
            />

            <TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register("password")}
            />

            {loginMutation.isError ? (
              <Alert severity="error">
                {loginMutation.error.message || "Falha ao realizar login"}
              </Alert>
            ) : null}

            <Button type="submit" variant="contained" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>

            {loginMutation.isSuccess ? (
              <Alert severity="success">Login realizado com sucesso</Alert>
            ) : null}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
