"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { IconButton, Tooltip } from "@mui/material";
import styles from "./pagination-controls.module.css";

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number | ((currentPage: number) => number)) => void;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className={styles.paginationBar}>
      <Tooltip title="Primeira página">
        <span>
          <IconButton
            className={styles.pageButton}
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
            size="small"
          >
            <KeyboardDoubleArrowLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Página anterior">
        <span>
          <IconButton
            className={styles.pageButton}
            disabled={page <= 1}
            onClick={() =>
              onPageChange((currentPage) => Math.max(1, currentPage - 1))
            }
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <span className={styles.pageInfo}>
        {page} de {safeTotalPages}
      </span>
      <Tooltip title="Próxima página">
        <span>
          <IconButton
            className={styles.pageButton}
            disabled={page >= safeTotalPages}
            onClick={() =>
              onPageChange((currentPage) =>
                Math.min(safeTotalPages, currentPage + 1),
              )
            }
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Última página">
        <span>
          <IconButton
            className={styles.pageButton}
            disabled={page >= safeTotalPages}
            onClick={() => onPageChange(safeTotalPages)}
            size="small"
          >
            <KeyboardDoubleArrowRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
}

export default PaginationControls;
