import type { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const withAuthAdmin = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthAdminComponent = (props: P) => {
    const { isAuthenticated, user } = useSelector(
      (state: RootState) => state.auth
    );

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (user?.role !== "admin") {
      return <Navigate to="/unauthorized" replace />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthAdminComponent;
};

export default withAuthAdmin;
