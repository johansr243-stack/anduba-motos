import { ALLOWED_ROLES, ROLE_LABELS } from "../config/global.config.js"

const dbGetRoles = ()=>{

    return ALLOWED_ROLES.map(( role ) => {

        return {
            id: role,
            name: ROLE_LABELS[role]
        }
    })
}

export default dbGetRoles