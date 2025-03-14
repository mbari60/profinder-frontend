"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import { useUser } from "@/app/context/userContext";
import api from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  RefreshCw,
  UserPlus,
  Trash2,
  Edit,
  Check,
  X,
} from "lucide-react";

// Memoized table row component to prevent unnecessary re-renders
const UserTableRow = memo(({ userData, onEdit, onDelete }) => (
  <TableRow key={userData.id}>
    <TableCell className="font-medium">{userData.username}</TableCell>
    <TableCell>{userData.email || "-"}</TableCell>
    <TableCell>{userData.phone_number || "-"}</TableCell>
    <TableCell>
      {userData.is_staff ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-red-600" />
      )}
    </TableCell>
    <TableCell>
      {userData.password_change_required ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-red-600" />
      )}
    </TableCell>
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(userData)}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Edit</span>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(userData)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <span className="sr-only">Delete</span>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
));

UserTableRow.displayName = "UserTableRow";

// Initial state for new user
const initialNewUser = {
  username: "",
  email: "",
  phone_number: "",
  password: "",
  is_staff: false,
  password_change_required: true,
};

const ManageUsers = () => {
  const { isAdmin, user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState(initialNewUser);
  const [error, setError] = useState("");

  // Memoized fetch users function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/users/");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  // Memoized handlers
  const handleCreateUser = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      try {
        const response = await api.post("/api/users/", newUser);
        setUsers((prevUsers) => [...prevUsers, response.data]);
        toast.success(`User ${newUser.username} created successfully.`);
        setOpenAddDialog(false);
        setNewUser(initialNewUser);
      } catch (err) {
        console.error("Failed to create user:", err);
        setError(
          err.response?.data?.detail ||
            "Failed to create user. Please try again."
        );
      }
    },
    [newUser]
  );

  const handleUpdateUser = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (!selectedUser) return;

      try {
        const response = await api.put(
          `/api/users/${selectedUser.id}/`,
          selectedUser
        );
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === selectedUser.id ? response.data : u))
        );
        toast.success(`User ${selectedUser.username} updated successfully.`);
        setOpenEditDialog(false);
      } catch (err) {
        console.error("Failed to update user:", err);
        setError(
          err.response?.data?.detail ||
            "Failed to update user. Please try again."
        );
      }
    },
    [selectedUser]
  );

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/api/users/${selectedUser.id}/`);
      setUsers((prevUsers) =>
        prevUsers.filter((u) => u.id !== selectedUser.id)
      );
      toast.success(`User ${selectedUser.username} deleted successfully.`);
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Failed to delete user. Please try again.");
    }
  }, [selectedUser]);

  const openEditUserDialog = useCallback((user) => {
    setSelectedUser({ ...user });
    setOpenEditDialog(true);
  }, []);

  const openDeleteUserDialog = useCallback((user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  }, []);

  // Handle form changes with a memoized handler
  const handleNewUserChange = useCallback((field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectedUserChange = useCallback(
    (field, value) => {
      if (!selectedUser) return;
      setSelectedUser((prev) => ({ ...prev, [field]: value }));
    },
    [selectedUser]
  );

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              You do not have permission to access this page. Please contact
              your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system. The user will be required to
                  change their password on first login.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) =>
                        handleNewUserChange("username", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        handleNewUserChange("email", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newUser.phone_number}
                      onChange={(e) =>
                        handleNewUserChange("phone_number", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        handleNewUserChange("password", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin"
                      checked={newUser.is_staff}
                      onCheckedChange={(checked) =>
                        handleNewUserChange("is_staff", checked)
                      }
                    />
                    <Label htmlFor="admin">Administrator Access</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="change_password"
                      checked={newUser.password_change_required}
                      onCheckedChange={(checked) =>
                        handleNewUserChange("password_change_required", checked)
                      }
                    />
                    <Label htmlFor="change_password">
                      Require Password Change
                    </Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Password Change Required</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan="6"
                        className="text-center py-8 text-gray-500"
                      >
                        No users found. Create a new user to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userData) => (
                      <UserTableRow
                        key={userData.id}
                        userData={userData}
                        onEdit={openEditUserDialog}
                        onDelete={openDeleteUserDialog}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Update user information. Password fields left blank will not
              change the current password.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>
          )}

          {selectedUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={selectedUser.username}
                    onChange={(e) =>
                      handleSelectedUserChange("username", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email || ""}
                    onChange={(e) =>
                      handleSelectedUserChange("email", e.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={selectedUser.phone_number || ""}
                    onChange={(e) =>
                      handleSelectedUserChange("phone_number", e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-admin"
                    checked={selectedUser.is_staff}
                    onCheckedChange={(checked) =>
                      handleSelectedUserChange("is_staff", checked)
                    }
                  />
                  <Label htmlFor="edit-admin">Administrator Access</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-change-password"
                    checked={selectedUser.password_change_required}
                    onCheckedChange={(checked) =>
                      handleSelectedUserChange(
                        "password_change_required",
                        checked
                      )
                    }
                  />
                  <Label htmlFor="edit-change-password">
                    Require Password Change
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{selectedUser?.username}
              "? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsers;
