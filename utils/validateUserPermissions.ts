type User = {
    permissions: string[];
    roles: string[];
}

type ValidadeUserPermissionsParams = {
    user: User;
    permissions?: string[];
    roles?: string[];
}

export function validateUserPermissions({ user, permissions, roles }: ValidadeUserPermissionsParams) {
    if (permissions?.length > 0) {
        //Esse every só retornará true se por acaso o usuário contemplar
        // todas as permissions que estão dentro do array
        const hasAllPermissions = permissions.every(permission => {
            return user.permissions.includes(permission);
        })

        if (!hasAllPermissions) {
            return false
        }
    }

    if (roles?.length > 0) {
        //Esse some verifica se o usuário contempla ao menos
        //uma dessas roles
        const hasAllRoles = roles.some(role => {
            return user.roles.includes(role);
        })

        if (!hasAllRoles) {
            return false;
        }
    }

    return true;
}