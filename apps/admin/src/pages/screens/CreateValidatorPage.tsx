import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useValidator } from "@/contexts/ValidatorContext";
import { ChevronLeft } from "lucide-react";

export const CreateValidatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { createValidator, state } = useValidator();
  const { isLoadingCreate, error } = state;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    protocol: "livepeer",
    fee_pct: 0,
    apy: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "fee_pct" || name === "apy" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createValidator(formData);
    if (result.success && result.data) {
      navigate(`/validators/${result.data.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Validator name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protocol <span className="text-red-500">*</span>
              </label>
              <Input
                name="protocol"
                value={formData.protocol}
                onChange={handleInputChange}
                placeholder="livepeer"
                required
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
                min="0"
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
                min="0"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                size="lg"
                disabled={isLoadingCreate}
                className="flex-1"
              >
                {isLoadingCreate ? "Creating..." : "Create Validator"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/validators")}
                disabled={isLoadingCreate}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
