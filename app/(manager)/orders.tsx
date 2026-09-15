// Orders were never rep-scoped — a manager sees exactly the same list a rep would, just
// reached from their own tab set. Re-exporting instead of duplicating the screen.
export { default } from '../(tabs)/orders';
