import React from "react";
import Layout from "../components/Layout";

const AdminLayout = ({ children, title = "Admin Dashboard", userName }) => {
  return (
    <Layout title={title} role="Admin" userName={userName}>
      {children}
    </Layout>
  );
};

export default AdminLayout;
