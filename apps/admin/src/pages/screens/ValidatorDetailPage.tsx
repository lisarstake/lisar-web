import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useValidator } from "@/contexts/ValidatorContext";
import { ChevronLeft } from "lucide-react";

export const ValidatorDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const { state, getValidatorById, updateValidator, updateValidatorStatus } = useValidator();
  const { selectedValidator, isLoadingSingle, isLoadingUpdate, isLoadingUpdateStatus, error } = state;

  const [formData, setFormData] = useState({
    name: "",
    fee_pct: 0,
    apy: 0,
    protocol: "",
  });

  const [statusData, setStatusData] = useState({
    isActive: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (validatorId) {
      getValidatorById(validatorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatorId]);

  useEffect(() => {
    if (selectedValidator) {
      setFormData({
        name: selectedValidator.name || "",
        fee_pct: selectedValidator.fee_pct || 0,
        apy: selectedValidator.apy || 0,
        protocol: selectedValidator.protocol || "",
      });
      setStatusData({
        isActive: selectedValidator.is_active || false,
      });
    }
  }, [selectedValidator]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fee_pct" || name === "apy" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusData({
      isActive: e.target.checked,
    });
  };

  const handleSave = async () => {
    if (!validatorId) return;

    const result = await updateValidator(validatorId, formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleStatusSave = async () => {
    if (!validatorId) return;

    const result = await updateValidatorStatus(validatorId, statusData);
    if (result.success) {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoadingSingle) {
    return (
      <div className="space-y-6">
       
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !selectedValidator) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/validators")}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Validators
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || "Validator not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Update Details Card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Validator Information
              </h2>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Validator name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Percentage
                  </label>
                  <Input
                    type="number"
                    name="fee_pct"
                    value={formData.fee_pct}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    APY
                  </label>
                  <Input
                    type="number"
                    name="apy"
                    value={formData.apy}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protocol
                  </label>
                  <Input
                    name="protocol"
                    value={formData.protocol}
                    onChange={handleInputChange}
                    placeholder="livepeer"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="lg"
                    onClick={handleSave}
                    disabled={isLoadingUpdate}
                    className="flex-1"
                  >
                    {isLoadingUpdate ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: selectedValidator.name || "",
                        fee_pct: selectedValidator.fee_pct || 0,
                        apy: selectedValidator.apy || 0,
                        protocol: selectedValidator.protocol || "",
                      });
                    }}
                    disabled={isLoadingUpdate}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedValidator.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Address</span>
                  <span className="text-sm font-mono text-gray-900">
                    {selectedValidator.address}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Protocol</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedValidator.protocol}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fee Percentage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedValidator.fee_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">APY</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedValidator.apy}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Delegated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedValidator.total_delegated_lisar.toLocaleString()} LPT
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
              {!isUpdatingStatus && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsUpdatingStatus(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {isUpdatingStatus ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={statusData.isActive}
                    onChange={handleStatusChange}
                    className="w-4 h-4 text-[#235538] border-gray-300 rounded focus:ring-[#235538]"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Active
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="lg"
                    onClick={handleStatusSave}
                    disabled={isLoadingUpdateStatus}
                    className="flex-1"
                  >
                    {isLoadingUpdateStatus ? "Saving..." : "Save Status"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsUpdatingStatus(false);
                      setStatusData({
                        isActive: selectedValidator.is_active || false,
                      });
                    }}
                    disabled={isLoadingUpdateStatus}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge
                    className={
                      selectedValidator.is_active
                        ? "bg-green-100 text-green-800 border-0 text-xs"
                        : "bg-gray-100 text-gray-800 border-0 text-xs"
                    }
                  >
                    {selectedValidator.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedValidator.created_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Updated Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedValidator.updated_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

