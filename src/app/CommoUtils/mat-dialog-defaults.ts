import { MatDialogConfig } from '@angular/material/dialog';

/**
 * Global MatDialog defaults (provide via MAT_DIALOG_DEFAULT_OPTIONS in app.module).
 * Slightly longer enter/exit than Material’s defaults so opens/closes feel smoother.
 */
export const APP_MAT_DIALOG_DEFAULT_CONFIG: MatDialogConfig = {
  enterAnimationDuration: '450ms',
  exitAnimationDuration: '320ms',
  autoFocus: false,
  restoreFocus: true,
};
