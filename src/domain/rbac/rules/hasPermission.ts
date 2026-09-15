export function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes(required);
}

export function hasAllPermissions(userPermissions: string[], required: string[]): boolean {
  return required.every((p) => userPermissions.includes(p));
}

export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  return required.some((p) => userPermissions.includes(p));
}
