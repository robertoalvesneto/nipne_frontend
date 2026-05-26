import { CardProps, Card as MuiCard } from "@mui/material"

import styles from "./card.module.css"

export const Card = (props: CardProps) => {
    return <MuiCard className={styles.card} {...props} />
}