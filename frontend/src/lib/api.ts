import axios from "axios";

async function register(username: string, password: string) {
  const res = await axios.post("/api/register", { username, password });
}

async function login(username: string, password: string) {
  const res = await axios.post("/api/login", {username, password})
}

export const auth = {
  register, login
};

