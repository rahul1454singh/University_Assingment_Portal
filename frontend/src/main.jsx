import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./css/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(

    <React.StrictMode>

        <BrowserRouter>

            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={12}
                toastOptions={{

                    duration:3000,

                    style:{

                        background:"#ffffff",
                        color:"#222",
                        borderRadius:"10px",
                        padding:"14px 18px",
                        fontSize:"14px",
                        fontWeight:"600",
                        boxShadow:"0 8px 25px rgba(0,0,0,.12)"

                    },

                    success:{

                        iconTheme:{

                            primary:"#22c55e",
                            secondary:"#fff"

                        }

                    },

                    error:{

                        iconTheme:{

                            primary:"#ef4444",
                            secondary:"#fff"

                        }

                    },

                    loading:{

                        iconTheme:{

                            primary:"#2563eb",
                            secondary:"#fff"

                        }

                    }

                }}
            />

            <App />

        </BrowserRouter>

    </React.StrictMode>

);