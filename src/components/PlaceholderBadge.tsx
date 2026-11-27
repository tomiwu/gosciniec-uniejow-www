import { PLACEHOLDER_BADGE_TEXT } from '@/content/placeholders';
import styles from './PlaceholderBadge.module.css';

/** Visible mark of a sample figure. Every page that shows a placeholder record uses it. */
export function PlaceholderBadge() {
  return <span className={styles.badge}>{PLACEHOLDER_BADGE_TEXT}</span>;
}
