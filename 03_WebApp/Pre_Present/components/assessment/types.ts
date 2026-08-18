/**
 * How a choice was made.
 *
 * Arrow keys traverse a radiogroup, so they must be able to change the
 * selection without being read as the learner's final answer — otherwise the
 * first arrow press commits a value and the auto-advance carries the learner
 * away from the question they were still reading. Only a pointer click, or the
 * Enter/Space that a button turns into a click, counts as committing.
 */
export type SelectionSource = "pointer" | "keyboard";
