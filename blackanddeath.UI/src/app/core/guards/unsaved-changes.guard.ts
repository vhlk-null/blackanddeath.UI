import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  console.log('unsavedChangesGuard called', component);
  console.log('canDeactivate:', component.canDeactivate());
  if (component.canDeactivate()) {
    return true;
  }
  return confirm('You have unsaved changes. Are you sure you want to leave?');
};
