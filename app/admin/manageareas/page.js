"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, Plus, Pencil, Trash2, Check, X, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/utils/api";

const CountyAndAreaManagement = () => {
  // State
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCounties, setExpandedCounties] = useState(new Set());
  const [newCountyName, setNewCountyName] = useState("");
  const [editingCounty, setEditingCounty] = useState(null);
  const [editingCountyName, setEditingCountyName] = useState("");
  const [editingArea, setEditingArea] = useState(null);
  const [newAreaData, setNewAreaData] = useState({});
  const [editingAreaName, setEditingAreaName] = useState("");

  // Refs
  const editInputRef = useRef(null);
  const newCountyInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch counties
  const fetchCounties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/counties/");
      setCounties(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounties();
  }, [fetchCounties]);

  // County operations
  const handleAddCounty = useCallback(async () => {
    if (!newCountyName.trim()) return;
    try {
      await api.post("/api/counties/", { name: newCountyName });
      setNewCountyName("");
      fetchCounties();
      newCountyInputRef.current?.focus();
    } catch (err) {
      setError("Failed to add county");
    }
  }, [newCountyName, fetchCounties]);

  const handleUpdateCounty = useCallback(async (id) => {
    if (!editingCountyName.trim()) return;
    try {
      await api.put(`/api/counties/${id}/`, { name: editingCountyName });
      setEditingCounty(null);
      setEditingCountyName("");
      fetchCounties();
    } catch (err) {
      setError("Failed to update county");
    }
  }, [editingCountyName, fetchCounties]);

  const handleDeleteCounty = useCallback(async (id) => {
    if (!window.confirm("Delete this county and all its areas?")) return;
    try {
      await api.delete(`/api/counties/${id}/`);
      fetchCounties();
    } catch (err) {
      setError("Failed to delete county");
    }
  }, [fetchCounties]);

  // Area operations
  const handleAddArea = useCallback(async (countyId) => {
    const areaName = newAreaData[countyId];
    if (!areaName?.trim()) return;
    try {
      await api.post("/api/specific-areas/", {
        name: areaName,
        county: countyId,
      });
      // Preserve the input state for continuous typing
      fetchCounties();
    } catch (err) {
      setError("Failed to add area");
    }
  }, [newAreaData, fetchCounties]);

  const handleUpdateArea = useCallback(async (id) => {
    if (!editingAreaName.trim()) return;
    try {
      await api.put(`/api/specific-areas/${id}/`, { name: editingAreaName });
      setEditingArea(null);
      setEditingAreaName("");
      fetchCounties();
    } catch (err) {
      setError("Failed to update area");
    }
  }, [editingAreaName, fetchCounties]);

  const handleDeleteArea = useCallback(async (id) => {
    if (!window.confirm("Delete this area?")) return;
    try {
      await api.delete(`/api/specific-areas/${id}/`);
      fetchCounties();
    } catch (err) {
      setError("Failed to delete area");
    }
  }, [fetchCounties]);

  // Filter counties
  const filteredCounties = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return counties
      .map(county => ({
        ...county,
        specific_areas: county.specific_areas?.filter(area => 
          area.name.toLowerCase().includes(term)
        ),
        matched: county.name.toLowerCase().includes(term),
      }))
      .filter(county => county.matched || county.specific_areas?.length > 0);
  }, [counties, searchTerm]);

  // Components
  const AreaItem = React.memo(({ area, countyId }) => {
    return (
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
        {editingArea === area.id ? (
          <div className="flex gap-2 flex-1">
            <Input
              value={editingAreaName}
              onChange={(e) => {
                setEditingAreaName(e.target.value);
                // Prevent losing focus
                e.target.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateArea(area.id);
                if (e.key === "Escape") {
                  setEditingArea(null);
                  setEditingAreaName("");
                }
              }}
            />
            <Button
              onClick={() => handleUpdateArea(area.id)}
              disabled={!editingAreaName.trim()}
            >
              <Check size={16} />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingArea(null);
                setEditingAreaName("");
              }}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <>
            <span className="font-medium">{area.name}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingArea(area.id);
                  setEditingAreaName(area.name);
                }}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteArea(area.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  });

  const CountyCard = React.memo(({ county }) => {
    return (
      <Card key={county.id} className="border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            {editingCounty === county.id ? (
              <div className="flex gap-2 flex-1">
                <Input
                  value={editingCountyName}
                  onChange={(e) => {
                    setEditingCountyName(e.target.value);
                    // Prevent losing focus
                    e.target.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateCounty(county.id);
                    if (e.key === "Escape") {
                      setEditingCounty(null);
                      setEditingCountyName("");
                    }
                  }}
                />
                <Button
                  onClick={() => handleUpdateCounty(county.id)}
                  disabled={!editingCountyName.trim()}
                >
                  <Check size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingCounty(null);
                    setEditingCountyName("");
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <h3 className="text-lg font-semibold">
                    {county.name}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({county.specific_areas?.length || 0} areas)
                    </span>
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newSet = new Set(expandedCounties);
                      newSet.has(county.id) 
                        ? newSet.delete(county.id) 
                        : newSet.add(county.id);
                      setExpandedCounties(newSet);
                    }}
                    className="flex items-center gap-2"
                  >
                    {expandedCounties.has(county.id) ? (
                      <>
                        <EyeOff size={16} />
                        <span className="hidden sm:inline">Hide Areas</span>
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        <span className="hidden sm:inline">Show Areas</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingCounty(county.id);
                      setEditingCountyName(county.name);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteCounty(county.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </>
            )}
          </div>

          {(expandedCounties.has(county.id) || searchTerm) && (
            <div className="pl-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAreaData[county.id] || ""}
                  onChange={(e) => {
                    setNewAreaData(prev => ({
                      ...prev,
                      [county.id]: e.target.value
                    }));
                    // Prevent losing focus
                    e.target.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddArea(county.id);
                  }}
                  placeholder="New area name"
                />
                <Button
                  onClick={() => handleAddArea(county.id)}
                  disabled={!newAreaData[county.id]?.trim()}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Area</span>
                </Button>
              </div>

              <div className="space-y-2">
                {county.specific_areas?.map((area) => (
                  <AreaItem key={area.id} area={area} countyId={county.id} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  });

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Counties & Areas Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search counties and areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="New county name"
              value={newCountyName}
              onChange={(e) => setNewCountyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCounty();
              }}
            />
            <Button
              onClick={handleAddCounty}
              disabled={!newCountyName.trim()}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add County</span>
            </Button>
          </div>

          {loading && counties.length === 0 ? (
            <div className="text-center">Loading...</div>
          ) : filteredCounties.length === 0 ? (
            <div className="text-center">No counties found</div>
          ) : (
            <div className="space-y-4">
              {filteredCounties.map((county) => (
                <CountyCard key={county.id} county={county} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CountyAndAreaManagement;
