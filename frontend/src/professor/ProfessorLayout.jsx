import React from "react";
import Layout from "../components/Layout";

const ProfessorLayout = ({ children, title = "Professor Dashboard", userName }) => {
  return (
    <Layout title={title} role="Professor" userName={userName}>
      {children}
    </Layout>
  );
};

export default ProfessorLayout;
