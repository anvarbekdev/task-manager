import { useMutation } from "react-query";
import { LoginFormData } from "~/validation/schemas";

export const useLogin = () =>
  useMutation(async (data: LoginFormData) => {
    if (data.login !== "admin") {
      throw { field: "login", message: "Login not found" };
    }
    if (data.password !== "1234") {
      throw { field: "password", message: "Incorrect password" };
    }

    return { login: data.login, password: data.password };
  });
