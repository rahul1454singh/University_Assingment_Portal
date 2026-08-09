import axios from "axios";

const api = axios.create({
    baseURL: "https://university-assingment-portal-irjm.vercel.app",
    withCredentials: true
});

export default api;