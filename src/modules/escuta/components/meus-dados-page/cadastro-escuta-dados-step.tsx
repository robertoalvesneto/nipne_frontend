import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import type { Course } from "@/modules/aluno/interfaces/course";
import type { DisciplinaOferta } from "@/modules/disciplina/interfaces/disciplina-oferta";
import { formatPhone } from "@/shared/utils/phone-mask";
import type { QuestionarioCadastro } from "../../interfaces/questionario-cadastro";
import type { CadastroValues } from "./cadastro-escuta-types";
import styles from "./meus-dados-page.module.css";

function getProfessoresText(disciplina: DisciplinaOferta) {
  return (
    disciplina.professores
      .map(
        (professor) =>
          professor.pessoaInstitucional.nomeSocial?.trim() ||
          professor.pessoaInstitucional.nome,
      )
      .join(", ") || "-"
  );
}

interface CadastroEscutaDadosStepProps {
  courses: Course[];
  values: CadastroValues;
  selectedClassGroupId: string;
  selectedClassGroups: DisciplinaOferta[];
  availableClassGroups: DisciplinaOferta[];
  classGroupsLoading: boolean;
  questionario?: QuestionarioCadastro;
  isSelectedClassGroupAvailable: boolean;
  onValueChange: (field: keyof CadastroValues, value: string | boolean) => void;
  onCourseChange: (event: SelectChangeEvent) => void;
  onClassGroupChange: (event: SelectChangeEvent) => void;
  onAddClassGroup: () => void;
  onRemoveClassGroup: (classGroupId: string) => void;
}

export function CadastroEscutaDadosStep({
  courses,
  values,
  selectedClassGroupId,
  selectedClassGroups,
  availableClassGroups,
  classGroupsLoading,
  questionario,
  isSelectedClassGroupAvailable,
  onValueChange,
  onCourseChange,
  onClassGroupChange,
  onAddClassGroup,
  onRemoveClassGroup,
}: CadastroEscutaDadosStepProps) {
  const tipoOfertaEspecialQuestion = questionario?.secoes
    .flatMap((section) => section.perguntas)
    .find((question) => question.id === "tipo_oferta_especial");

  return (
    <>
      <section className={styles.formSection}>
        <h3>Identificação Pessoal</h3>
        <div className={styles.formGrid}>
          <TextField
            label="Nome"
            value={values.nome}
            onChange={(event) => onValueChange("nome", event.target.value)}
            size="small"
            required
          />
          <TextField
            label="Data de nascimento"
            type="date"
            value={values.dataNascimento}
            onChange={(event) =>
              onValueChange("dataNascimento", event.target.value)
            }
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Telefone (Whatsapp) *"
            value={formatPhone(values.telefoneWhatsapp)}
            onChange={(event) =>
              onValueChange("telefoneWhatsapp", formatPhone(event.target.value))
            }
            placeholder="(92) 99999-9999"
            size="small"
            slotProps={{
              htmlInput: {
                inputMode: "tel",
                maxLength: 15,
              },
            }}
          />
          <TextField
            label="E-mail pessoal *"
            value={values.emailPessoal}
            onChange={(event) =>
              onValueChange("emailPessoal", event.target.value)
            }
            size="small"
          />
          <TextField
            label="Outro contato"
            value={values.outroContato}
            onChange={(event) =>
              onValueChange("outroContato", event.target.value)
            }
            size="small"
          />
          <FormControl size="small">
            <InputLabel id="forma-contato-label">Forma preferencial</InputLabel>
            <Select
              labelId="forma-contato-label"
              label="Forma preferencial *"
              value={values.formaPreferencialContato}
              onChange={(event) =>
                onValueChange("formaPreferencialContato", event.target.value)
              }
            >
              <MenuItem value="Whatsapp">Whatsapp</MenuItem>
              <MenuItem value="E-mail">E-mail</MenuItem>
              <MenuItem value="Telefone">Telefone</MenuItem>
            </Select>
          </FormControl>
        </div>
      </section>

      <section className={styles.formSection}>
        <h3>Identificação Acadêmica</h3>
        <div className={styles.formGrid}>
          <FormControl size="small" required>
            <InputLabel id="curso-label">Curso</InputLabel>
            <Select
              labelId="curso-label"
              label="Curso"
              value={values.cursoId}
              onChange={onCourseChange}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.sigla} - {course.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Matrícula"
            value={values.matricula}
            onChange={(event) => onValueChange("matricula", event.target.value)}
            size="small"
            required
          />
          <TextField
            label="E-mail institucional"
            value={values.emailInstitucional}
            size="small"
            required
            disabled
          />
          <FormControl size="small">
            <InputLabel id="modalidade-label">Modalidade</InputLabel>
            <Select
              labelId="modalidade-label"
              label="Modalidade"
              value={values.modalidadeCurso}
              onChange={(event) =>
                onValueChange("modalidadeCurso", event.target.value)
              }
            >
              <MenuItem value="Bacharelado">Bacharelado</MenuItem>
              <MenuItem value="Licenciatura">Licenciatura</MenuItem>
              <MenuItem value="Tecnólogo">Tecnólogo</MenuItem>
            </Select>
          </FormControl>
        </div>
        <FormControl className={styles.radioGroup}>
          <span>Oferta do curso</span>
          <RadioGroup
            row
            value={values.ofertaCurso}
            onChange={(event) =>
              onValueChange("ofertaCurso", event.target.value)
            }
          >
            <FormControlLabel
              value="Regular"
              control={<Radio />}
              label="Regular"
            />
            <FormControlLabel
              value="Especial"
              control={<Radio />}
              label="Especial"
            />
          </RadioGroup>
        </FormControl>
        {values.ofertaCurso === "Especial" ? (
          <FormControl
            className={styles.specialOfferField}
            size="small"
            required
          >
            <InputLabel id="tipo-oferta-especial-label">
              Tipo de oferta especial
            </InputLabel>
            <Select
              labelId="tipo-oferta-especial-label"
              label="Tipo de oferta especial"
              value={values.tipoOfertaEspecial}
              onChange={(event) =>
                onValueChange("tipoOfertaEspecial", event.target.value)
              }
              disabled={!tipoOfertaEspecialQuestion}
            >
              {tipoOfertaEspecialQuestion?.opcoes?.map((option) => (
                <MenuItem key={option.valor} value={option.valor}>
                  {option.rotulo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
      </section>

      <section className={styles.formSection}>
        <div className={styles.disciplineHeader}>
          <h3>Disciplinas cursadas</h3>
          <span>{selectedClassGroups.length} selecionada(s)</span>
        </div>

        <div className={styles.addDisciplineRow}>
          <FormControl className={styles.disciplineSelect} size="small">
            <InputLabel id="escuta-class-group-label">Disciplina</InputLabel>
            <Select
              labelId="escuta-class-group-label"
              label="Disciplina"
              value={selectedClassGroupId}
              onChange={onClassGroupChange}
              disabled={!values.cursoId || classGroupsLoading}
            >
              <MenuItem value="" disabled>
                Selecione uma disciplina
              </MenuItem>
              {availableClassGroups.map((classGroup) => (
                <MenuItem key={classGroup.id} value={classGroup.id}>
                  {classGroup.disciplina.nome} - {classGroup.periodoLetivo.nome}{" "}
                  - {classGroup.sigla}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={onAddClassGroup}
            disabled={!isSelectedClassGroupAvailable}
          >
            Adicionar
          </Button>
        </div>

        <div className={styles.disciplineTable}>
          <div className={styles.drawerDisciplineRowHeader}>
            <span>Disciplina</span>
            <span>Professor</span>
            <span>Período</span>
            <span />
          </div>
          {selectedClassGroups.length ? (
            selectedClassGroups.map((classGroup) => (
              <div className={styles.drawerDisciplineRow} key={classGroup.id}>
                <span>{classGroup.disciplina.nome}</span>
                <span>{getProfessoresText(classGroup)}</span>
                <span>
                  {classGroup.periodoLetivo.nome}
                </span>
                <IconButton
                  aria-label={`Remover ${classGroup.disciplina.nome}`}
                  color="error"
                  onClick={() => onRemoveClassGroup(classGroup.id)}
                  size="small"
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Nenhuma disciplina adicionada.</p>
          )}
        </div>
      </section>
    </>
  );
}
