import React from "react";
import Layout from "../components/Layout";

const StudentLayout = ({ children, title = "Student Dashboard", userName }) => {
  return (
    <Layout title={title} role="Student" userName={userName}>
      {children}
    </Layout>
  );
};

export default StudentLayout;