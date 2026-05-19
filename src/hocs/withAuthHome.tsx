import type { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const withAuthHome = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuthHome;
