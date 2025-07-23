import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Users, UserCheck, UserX, Search, Mail, Calendar } from 'lucide-react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'chef' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  joinedAt: string;
  recipesCount: number;
  lastLogin: string;
}

export const AdminUserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

 // AdminUserManager.tsx
 const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Fetched users:', res.data);
      // Transform backend data to match User interface
      const transformedUsers = res.data.map((user: any) => ({
        id: user._id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        status: user.isBanned ? 'banned' : user.isChefActive && user.role === 'chef' ? 'active' : 'inactive',
        role:user.role,
        joinedAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
        recipesCount: user.recipesCount, // Placeholder; requires backend to provide this
        lastLogin: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : 'N/A', // Use updatedAt as proxy
      }));
      setUsers(transformedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      alert('Failed to fetch users');
    }
  };
useEffect(() => {
  fetchUsers();
}, []);
  // AdminUserManager.tsx
const handleUserStatusChange = async (userId: string, newStatus: User['status'],role:User['role']) => {
  try {
    const isBanned = newStatus === 'banned';
    const isChefActive = newStatus === 'active' && role === 'chef';
    const res=await axios.put(
      `http://localhost:3000/api/users/${userId}/ban`,
      { isBanned , isChefActive },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status:newStatus } : user
      )
    );
    await fetchUsers();
    alert(res.data.message||'User status updated successfully');
  } catch (err) {
    console.error('Failed to update user status:', err);
    alert('Failed to update user status');
  }
};

const handlePromoteToAdmin = async (userId: string ) => {
  try {
    const res = await axios.put(
      `http://localhost:3000/api/users/${userId}/promote`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    const promotedUser = users.find(u => u.id === userId);
    if (promotedUser) {
      const updatedUser = { ...promotedUser, role: 'admin' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    alert(res.data.message || 'User promoted to admin successfully');
    fetchUsers();
  } catch (err) {
    console.error('Failed to promote user:', err);
    alert('Failed to promote user');
  }
};
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><UserCheck className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'banned':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><UserX className="h-3 w-3 mr-1" />Banned</Badge>;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalUsers = users.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <Button onClick={fetchUsers} variant="outline" className="mt-2">
              Refresh Users
          </Button>

          <CardDescription>Manage user accounts and permissions</CardDescription>
          <div className="flex items-center space-x-2 mt-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Recipes</TableHead>
                
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{user.joinedAt}</TableCell>
                  <TableCell>{user.recipesCount}</TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      {user.role==='chef' && user.status!== 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleUserStatusChange(user.id, 'active',user.role)}
                        >
                          Activate
                        </Button>
                      )}
                      {user.status !== 'banned' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleUserStatusChange(user.id, 'banned' ,user.role)}
                        >
                          Ban
                        </Button>
                      )}
                      {user.role !== 'admin' && (
                        <Button
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => handlePromoteToAdmin(user.id)}
                          >
                            Promote
                          </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
