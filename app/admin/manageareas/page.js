"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/utils/api";

const CountyAndAreaManagement = () => {
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCounties, setExpandedCounties] = useState(new Set());

  // County states
  const [newCountyName, setNewCountyName] = useState("");
  const [editingCounty, setEditingCounty] = useState(null);

  // Area states
  const [editingArea, setEditingArea] = useState(null);
  const [newAreaData, setNewAreaData] = useState({});
  const [editingAreaName, setEditingAreaName] = useState("");

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

  const toggleCountyExpansion = useCallback((countyId) => {
    setExpandedCounties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(countyId)) {
        newSet.delete(countyId);
      } else {
        newSet.add(countyId);
      }
      return newSet;
    });
  }, []);

  // Filter counties and areas based on search
  const filteredCounties = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return counties
      .map((county) => ({
        ...county,
        specific_areas: county.specific_areas?.filter((area) =>
          area.name.toLowerCase().includes(lowerSearchTerm)
        ),
        matched: county.name.toLowerCase().includes(lowerSearchTerm),
      }))
      .filter(
        (county) =>
          county.matched ||
          (county.specific_areas && county.specific_areas.length > 0)
      );
  }, [counties, searchTerm]);

  // County CRUD operations
  const handleAddCounty = useCallback(async () => {
    if (!newCountyName.trim()) return;
    try {
      await api.post("/api/counties/", { name: newCountyName });
      setNewCountyName("");
      fetchCounties();
    } catch (err) {
      setError("Failed to add county");
    }
  }, [newCountyName, fetchCounties]);

  const handleUpdateCounty = useCallback(
    async (id, name) => {
      try {
        await api.put(`/api/counties/${id}/`, { name });
        setEditingCounty(null);
        fetchCounties();
      } catch (err) {
        setError("Failed to update county");
      }
    },
    [fetchCounties]
  );

  const handleDeleteCounty = useCallback(
    async (id) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this county and all its areas?"
        )
      )
        return;
      try {
        await api.delete(`/api/counties/${id}/`);
        fetchCounties();
      } catch (err) {
        setError("Failed to delete county");
      }
    },
    [fetchCounties]
  );

  // Area CRUD operations
  const handleAddArea = useCallback(
    async (countyId) => {
      if (!newAreaData[countyId]?.trim()) return;
      try {
        await api.post("/api/specific-areas/", {
          name: newAreaData[countyId],
          county: countyId,
        });
        setNewAreaData((prev) => ({ ...prev, [countyId]: "" }));
        fetchCounties();
      } catch (err) {
        setError("Failed to add area");
      }
    },
    [newAreaData, fetchCounties]
  );

  const handleUpdateArea = useCallback(
    async (id, name, countyId) => {
      if (!name.trim()) return;
      try {
        await api.put(`/api/specific-areas/${id}/`, {
          name,
          county: countyId,
        });
        setEditingArea(null);
        setEditingAreaName("");
        fetchCounties();
      } catch (err) {
        setError("Failed to update area");
      }
    },
    [fetchCounties]
  );

  const handleDeleteArea = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this area?")) return;
      try {
        await api.delete(`/api/specific-areas/${id}/`);
        fetchCounties();
      } catch (err) {
        setError("Failed to delete area");
      }
    },
    [fetchCounties]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleNewCountyChange = useCallback((e) => {
    setNewCountyName(e.target.value);
  }, []);

  const handleNewAreaChange = useCallback((countyId, value) => {
    setNewAreaData((prev) => ({
      ...prev,
      [countyId]: value,
    }));
  }, []);

  const resetEditState = useCallback(() => {
    setEditingArea(null);
    setEditingAreaName("");
  }, []);

  // Memoized components
  const CountyCard = React.memo(({ county }) => {
    return (
      <Card key={county.id} className="border-2">
        <CardContent className="p-4">
          {/* County Header */}
          <div className="flex items-center justify-between mb-4">
            {editingCounty === county.id ? (
              <div className="flex gap-2 flex-1">
                <Input
                  defaultValue={county.name}
                  onChange={handleNewCountyChange}
                />
                <Button
                  onClick={() => handleUpdateCounty(county.id, newCountyName)}
                >
                  <Check size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingCounty(null)}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <h3 className="text-lg font-semibold">
                    {county.name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({county.specific_areas?.length || 0} areas)
                    </span>
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => toggleCountyExpansion(county.id)}
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
                    onClick={() => setEditingCounty(county.id)}
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

          {/* Areas Section */}
          {(expandedCounties.has(county.id) || searchTerm) && (
            <div className="pl-4 space-y-4">
              {/* Add Area Form */}
              <div className="flex gap-2">
                <Input
                  placeholder="New area name"
                  value={newAreaData[county.id] || ""}
                  onChange={(e) =>
                    handleNewAreaChange(county.id, e.target.value)
                  }
                />
                <Button
                  onClick={() => handleAddArea(county.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Area</span>
                </Button>
              </div>

              {/* Areas List */}
              <div className="space-y-2">
                {county.specific_areas?.map((area) => (
                  <AreaItem
                    key={area.id}
                    area={area}
                    countyId={county.id}
                    editingArea={editingArea}
                    editingAreaName={editingAreaName}
                    setEditingArea={setEditingArea}
                    setEditingAreaName={setEditingAreaName}
                    handleUpdateArea={handleUpdateArea}
                    resetEditState={resetEditState}
                    handleDeleteArea={handleDeleteArea}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  });

  const AreaItem = React.memo(
    ({
      area,
      countyId,
      editingArea,
      editingAreaName,
      setEditingArea,
      setEditingAreaName,
      handleUpdateArea,
      resetEditState,
      handleDeleteArea,
    }) => {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          {editingArea === area.id ? (
            <div className="flex gap-2 flex-1">
              <Input
                value={editingAreaName || area.name}
                onChange={(e) => setEditingAreaName(e.target.value)}
                className="bg-gray-700 text-white border-gray-600"
              />
              <Button
                onClick={() =>
                  handleUpdateArea(
                    area.id,
                    editingAreaName || area.name,
                    countyId
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check size={16} />
              </Button>
              <Button
                variant="outline"
                onClick={resetEditState}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <>
              <span className="font-medium text-white">{area.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingArea(area.id);
                    setEditingAreaName(area.name);
                  }}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteArea(area.id)}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      );
    }
  );

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
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search counties and areas..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Add County Section */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="New county name"
              value={newCountyName}
              onChange={handleNewCountyChange}
            />
            <Button
              onClick={handleAddCounty}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add County</span>
            </Button>
          </div>

          {/* Counties and Areas List */}
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
