import { Router } from "express";
import { createUsers } from "../controllers/user.controller.js";
import { loginUser, renewToken, requestPasswordReset, resetPassword, verifyResetCode } from "../controllers/auth.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { removeRole } from "../middlewares/without-rol.middleware.js";

const router = Router() //(para usuarios)

// /login

router.post('/login', loginUser)

// /register

router.post('/register', removeRole ,createUsers) // /api/auth/register

// /renew-token

router.get('/renew-token', authenticationUser ,renewToken)

router.post('/forgot-password', requestPasswordReset);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);



export default router