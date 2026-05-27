"use client";

import type { ReactNode } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import styles from "./table.module.css";

export interface TableColumn<TData> {
  key: keyof TData | string;
  header: ReactNode;
  render?: (row: TData, rowIndex: number) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

export interface TableProps<TData> {
  columns: TableColumn<TData>[];
  data: TData[];
  getRowKey?: (row: TData, rowIndex: number) => string | number;
  actions?: (row: TData, rowIndex: number) => ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  className?: string;
  ariaLabel?: string;
}

function getCellValue<TData>(row: TData, column: TableColumn<TData>) {
  if (column.render) {
    return null;
  }

  if (typeof row !== "object" || row === null) {
    return null;
  }

  return (row as Record<string, ReactNode>)[String(column.key)] ?? null;
}

export function Table<TData>({
  columns,
  data,
  getRowKey,
  actions,
  emptyMessage = "Nenhum registro encontrado.",
  isLoading = false,
  loadingMessage = "Carregando registros...",
  className,
  ariaLabel = "Tabela de registros",
}: TableProps<TData>) {
  const hasActions = Boolean(actions);
  const columnSpan = columns.length + (hasActions ? 1 : 0);

  return (
    <TableContainer className={`${styles.wrapper} ${className ?? ""}`}>
      <MuiTable className={styles.table} aria-label={ariaLabel}>
        <TableHead>
          <TableRow className={styles.headerRow}>
            {columns.map((column) => (
              <TableCell
                key={String(column.key)}
                align={column.align ?? "left"}
                className={`${styles.headerCell} ${column.className ?? ""}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </TableCell>
            ))}
            {hasActions ? (
              <TableCell
                align="center"
                className={`${styles.headerCell} ${styles.actionsHeader}`}
                aria-label="Ações"
              />
            ) : null}
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className={styles.stateCell} colSpan={columnSpan}>
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && data.length === 0 ? (
            <TableRow>
              <TableCell className={styles.stateCell} colSpan={columnSpan}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading
            ? data.map((row, rowIndex) => (
                <TableRow
                  key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                  className={styles.row}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      align={column.align ?? "left"}
                      className={`${styles.cell} ${column.className ?? ""}`}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : getCellValue(row, column)}
                    </TableCell>
                  ))}
                  {hasActions ? (
                    <TableCell align="center" className={`${styles.cell} ${styles.actionsCell}`}>
                      {actions?.(row, rowIndex)}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            : null}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}

export default Table;
