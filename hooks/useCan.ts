import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

type useCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions = [], roles = [] }: useCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  if (roles?.length > 0) {
    const hasAllroles = roles?.some((role) => {
      return user.roles?.includes(role);
    });

    if (!hasAllroles) {
      return false;
    }
  }

  if (permissions?.length > 0) {
    const hasAllPermissions = permissions?.some((permission) => {
      return user.permissions?.includes(permission);
    });

    if (!hasAllPermissions) {
      return false;
    }
  }

  return true;
}
