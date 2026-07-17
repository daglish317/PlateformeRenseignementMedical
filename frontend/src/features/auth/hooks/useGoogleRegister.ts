// Since the same backend endpoint handles both login and register for Google, reuse useGoogleLogin
export { useGoogleLogin as useGoogleRegister } from "./useGoogleLogin";
