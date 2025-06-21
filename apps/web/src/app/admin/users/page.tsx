// apps/web/src/app/admin/users/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore, UserRole } from '../../../stores/authStore'; // Adjusted path
import { apiClient } from '../../../lib/api/apiClient'; // Adjusted path
import { useRouter } from 'next/navigation';

// Define a more specific User type based on expected API response
// This should ideally come from a shared package if API types are defined there
interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: { id: string; userId: string; role: UserRole; createdAt: string; updatedAt: string }[];
  // Add other fields if returned by the API and needed by the frontend
}

const AdminUsersPage = () => {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdministrator = useCallback(() => {
    return authUser?.roles.some(r => r.role === UserRole.ADMINISTRADOR);
  }, [authUser]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdministrator()) {
        // Redirect to a generic page or show an in-page access denied message
        // For now, an in-page message will be handled by the component's render logic
        console.warn("Acesso negado: o usuário não é ADMINISTRADOR.");
      }
    }
  }, [authUser, isAuthenticated, authLoading, router, isAdministrator]);

  const fetchUsers = useCallback(async () => {
    if (!isAdministrator()) return;

    setLoadingUsers(true);
    try {
      const response = await apiClient.get<ApiUser[]>('/users');
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Falha ao carregar usuários.');
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdministrator]);

  useEffect(() => {
    if (isAuthenticated && isAdministrator()) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdministrator, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isAdministrator()) {
        alert('Ação não permitida.');
        return;
    }
    try {
      // The API expects just the role string, e.g., { "role": "COMPRAS" }
      const response = await apiClient.patch<ApiUser>(`/users/${userId}/role`, { role: newRole });
      const updatedUser = response.data;
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, roles: updatedUser.roles } : u))
      );
      alert('Cargo atualizado com sucesso!'); // Replace with a proper toast notification
    } catch (err: any) {
      console.error('Error updating role:', err);
      alert(err.response?.data?.message || err.message || 'Falha ao atualizar cargo.'); // Replace with a proper toast notification
    }
  };

  if (authLoading) {
    return <div style={{ padding: '20px' }}>Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // This case should be handled by the redirect in useEffect, but as a fallback:
    return <div style={{ padding: '20px' }}>Você precisa estar logado para acessar esta página. Redirecionando...</div>;
  }

  if (!isAdministrator()) {
    return <div style={{ padding: '20px' }}>Acesso Negado. Você precisa ser um administrador para ver esta página.</div>;
  }

  if (loadingUsers) {
    return <div style={{ padding: '20px' }}>Carregando usuários...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px' }}>Erro: {error}</div>;
  }

  const availableRoles: UserRole[] = [UserRole.SOLICITANTE, UserRole.COMPRAS, UserRole.GERENCIA, UserRole.ADMINISTRADOR];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>Painel de Administração de Usuários</h1>
      {users.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Nome</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Cargo Atual</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Novo Cargo</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(currentUser => (
              <tr key={currentUser.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{currentUser.firstName} {currentUser.lastName}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{currentUser.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {currentUser.roles.map(r => r.role).join(', ') || 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  <select
                    defaultValue={currentUser.roles[0]?.role || ''} // Assumes one primary role for display/default
                    id={`role-select-${currentUser.id}`}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  <button
                    onClick={() => {
                      const selectElement = document.getElementById(`role-select-${currentUser.id}`) as HTMLSelectElement;
                      if (selectElement) {
                        handleRoleChange(currentUser.id, selectElement.value as UserRole);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Salvar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsersPage;
