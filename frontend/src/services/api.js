import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const defaultBaseURL = isLocal 
    ? "http://localhost:3000" 
    : "https://university-assingment-portal-irjm.vercel.app";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
    withCredentials: true
});

export default api;