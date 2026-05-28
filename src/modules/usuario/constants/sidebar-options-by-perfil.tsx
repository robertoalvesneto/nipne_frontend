import type { SidebarOptions } from "@/shared/components/sidebar/sidebar.types";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import type { PerfilUsuario } from "../types/perfil-usuario";

export const CoordenadorSidebarOptions: SidebarOptions = [
  {
    name: "Alunos",
    icon: <SchoolOutlinedIcon />,
    path: "/auth/coordenador/alunos/",
    ariaLabel: "Alunos",
  },
  {
    name: "Escutas",
    icon: <QuestionAnswerOutlinedIcon />,
    path: "/auth/coordenador/escutas/",
    ariaLabel: "Escutas",
  },
  {
    name: "Ocorrências",
    icon: <ErrorOutlineIcon />,
    path: "/auth/coordenador/ocorrencias/",
    ariaLabel: "Ocorrências",
  },
  {
    name: "Disciplinas",
    icon: <MenuBookRoundedIcon />,
    path: "/auth/coordenador/disciplinas/",
    ariaLabel: "Disciplinas",
  },
];

export const CoordenadorSidebarSideOptions: SidebarOptions = [
  {
    name: "Usuários",
    icon: <GroupOutlinedIcon />,
    path: "/auth/coordenador/usuarios/",
    ariaLabel: "Usuários",
  },
];

export const ReitorSidebarOptions: SidebarOptions = [
  {
    name: "Indicadores",
    icon: <InsightsOutlinedIcon />,
    path: "/auth/gestor/indicadores/",
    ariaLabel: "Indicadores",
  },
  {
    name: "Atendimentos",
    icon: <QuestionAnswerOutlinedIcon />,
    path: "/auth/gestor/atendimentos/",
    ariaLabel: "Atendimentos",
  },
  {
    name: "Disciplinas",
    icon: <MenuBookRoundedIcon />,
    path: "/auth/gestor/disciplinas/",
    ariaLabel: "Disciplinas",
  },
  {
    name: "Professores",
    icon: <SchoolOutlinedIcon />,
    path: "/auth/gestor/professores/",
    ariaLabel: "Professores",
  },
];

export const ReitorSidebarSideOptions: SidebarOptions = [
  {
    name: "Usuários",
    icon: <GroupOutlinedIcon />,
    path: "/auth/gestor/usuarios/",
    ariaLabel: "Usuários",
  },
];

export const AlunoSidebarOptions: SidebarOptions = [
  {
    name: "Meus Dados",
    icon: <SchoolOutlinedIcon />,
    path: "/auth/aluno/meus-dados/",
    ariaLabel: "Meus Dados",
  },
  {
    name: "Ocorrências",
    icon: <ErrorOutlineIcon />,
    path: "/auth/aluno/ocorrencias/",
    ariaLabel: "Ocorrências",
  },
  {
    name: "Minhas Disciplinas",
    icon: <MenuBookRoundedIcon />,
    path: "/auth/aluno/minhas-disciplinas/",
    ariaLabel: "Minhas Disciplinas",
  },
];

export const SidebarOptionsByPerfil: Record<
  PerfilUsuario,
  { main: SidebarOptions; side: SidebarOptions }
> = {
  ALUNO: {
    main: AlunoSidebarOptions,
    side: [],
  },
  BOLSISTA: {
    main: AlunoSidebarOptions,
    side: [],
  },
  PROFESSOR: {
    main: AlunoSidebarOptions,
    side: [],
  },
  COORDENADOR: {
    main: CoordenadorSidebarOptions,
    side: CoordenadorSidebarSideOptions,
  },
  GESTOR: {
    main: ReitorSidebarOptions,
    side: ReitorSidebarSideOptions,
  },
};
