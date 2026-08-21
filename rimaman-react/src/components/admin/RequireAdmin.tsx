import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Props {
  children: React.ReactNode;
}

export const RequireAdmin: React.FC<Props> = ({ children }) => {
  const { user, loading, checked, checkSession } = useAdminStore();

  useEffect(() => {
    if (!checked) checkSession();
  }, [checked, checkSession]);

  if (!checked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/connexion" replace />;
  }

  return <>{children}</>;
};
