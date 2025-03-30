"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import api from "@/utils/api";

const PropertyTypeManagement = () => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  const fetchPropertyTypes = async () => {
    try {
      const response = await api.get("/api/property-types/");
      setPropertyTypes(response.data);
    } catch (error) {
      toast.error("Failed to fetch property types");
    }
  };

  const handleAddType = async () => {
    if (!newType.trim()) {
      toast.warning("Please enter a property type name");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/api/property-types/", { name: newType });
      setPropertyTypes([...propertyTypes, response.data]);
      setNewType("");
      toast.success("Property type added successfully");
    } catch (error) {
      toast.error("Failed to add property type");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (type) => {
    setEditingId(type.id);
    setEditingName(type.name);
  };

  const handleUpdateType = async () => {
    if (!editingName.trim() || !editingId) {
      toast.warning("Please enter a property type name");
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/api/property-types/${editingId}/`, { name: editingName });
      setPropertyTypes(
        propertyTypes.map((type) =>
          type.id === editingId ? { ...type, name: editingName } : type
        )
      );
      setEditingId(null);
      toast.success("Property type updated successfully");
    } catch (error) {
      toast.error("Failed to update property type");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/property-types/${id}/`);
      setPropertyTypes(propertyTypes.filter((type) => type.id !== id));
      toast.success("Property type deleted successfully");
    } catch (error) {
      toast.error("Failed to delete property type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Property Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="New property type"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddType} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>
                    {editingId === type.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      type.name
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === type.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateType} disabled={loading}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEditing(type)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteType(type.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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

export default PropertyTypeManagement;
