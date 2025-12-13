export const DEFAULT_TENANT_SLUG =
  import.meta.env.VITE_DEFAULT_TENANT_SLUG ?? "akincilar";

export const tenantBasePath = `/${DEFAULT_TENANT_SLUG}`;
export const apiBasePath = `${tenantBasePath}/api`;

export function tenantHref(path: string) {
  if (!path.startsWith("/")) {
    throw new Error("tenantHref expects an absolute path starting with /");
  }

  return `${tenantBasePath}${path === "/" ? "" : path}`;
}
