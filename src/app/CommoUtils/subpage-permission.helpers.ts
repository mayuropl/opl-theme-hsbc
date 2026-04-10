import { environment } from 'src/environments/environment';

export const clickObj: { [key: string]: string } = {
  actions: '',
  isChecked: '',
  actionId: '',
};

export const isSubpageExists = (page: any, targetSubpageId: number): boolean => {
  if (environment.staticDemo) {
    return true;
  }
  if (page.subpages && Array.isArray(page.subpages)) {
    for (const subPage of page.subpages) {
      if (subPage.subpageId === targetSubpageId) {
        return true;
      }
      if (searchSubSubpages(subPage, targetSubpageId)) {
        return true;
      }
    }
  } else if (page.subSubpages && Array.isArray(page.subSubpages)) {
    for (const subPage of page.subSubpages) {
      if (subPage.subpageId === targetSubpageId) {
        return true;
      }
      if (searchSubSubpages(subPage, targetSubpageId)) {
        return true;
      }
    }
  }
  return false;
};

export const searchSubSubpages = (subPage: any, targetSubpageId: number): boolean => {
  if (subPage.subSubpages && Array.isArray(subPage.subSubpages)) {
    for (const subSubPage of subPage.subSubpages) {
      if (subSubPage.subpageId === targetSubpageId) {
        return true;
      }
      if (searchSubSubpages(subSubPage, targetSubpageId)) {
        return true;
      }
    }
  }
  return false;
};

export const isActionAvailable = (
  permissionData: any,
  targetId: number,
  actionId: number
): boolean => {
  if (environment.staticDemo) {
    return true;
  }
  if (permissionData?.subpages) {
    for (const subPage of permissionData.subpages || []) {
      if (subPage.subpageId === targetId && subPage.actions.some((action: any) => action.actionId === actionId)) {
        return true;
      }
      if (searchSubSubpagesForAction(subPage, targetId, actionId)) {
        return true;
      }
    }
  } else if (permissionData?.subSubpages.length > 0) {
    for (const subPage of permissionData.subSubpages || []) {
      if (subPage.subpageId === targetId && subPage.actions.some((action: any) => action.actionId === actionId)) {
        return true;
      }
      if (searchSubSubpagesForAction(subPage, targetId, actionId)) {
        return true;
      }
    }
  } else if (permissionData.actions && Array.isArray(permissionData.actions)) {
    if (permissionData.subpageId === targetId && permissionData.actions.some((action: any) => action.actionId === actionId)) {
      return true;
    }
  }

  return false;
};

const searchSubSubpagesForAction = (subPage: any, targetId: number, actionId: number): boolean => {
  for (const subSubPage of subPage.subSubpages || []) {
    if (subSubPage.subpageId === targetId && subSubPage.actions.some((action: any) => action.actionId === actionId)) {
      return true;
    }
    if (searchSubSubpagesForAction(subSubPage, targetId, actionId)) {
      return true;
    }
  }
  return false;
};

export const findSubpageData = (page: any, targetSubpageId: number): any | null => {
  if (page.subpages && Array.isArray(page.subpages)) {
    for (const subPage of page.subpages) {
      if (subPage.subpageId === targetSubpageId) {
        return subPage;
      }
      const found = searchSubSubpages(subPage, targetSubpageId);
      if (found) {
        return found;
      }
    }
  } else if (page.subSubpages && Array.isArray(page.subSubpages)) {
    for (const subPage of page.subSubpages) {
      if (subPage.subpageId === targetSubpageId) {
        return subPage;
      }
      const found = searchSubSubpagesData(subPage, targetSubpageId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const searchSubSubpagesData = (subPage: any, targetSubpageId: number): any | null => {
  if (subPage.subSubpages && Array.isArray(subPage.subSubpages)) {
    for (const subSubPage of subPage.subSubpages) {
      if (subSubPage.subpageId === targetSubpageId) {
        return subSubPage;
      }
      const found = searchSubSubpagesData(subSubPage, targetSubpageId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};
