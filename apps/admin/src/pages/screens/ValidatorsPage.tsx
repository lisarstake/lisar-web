import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useValidator } from "@/contexts/ValidatorContext";
import { ValidatorFilters } from "@/services/validators/types";
import { ValidatorList } from "./components/ValidatorList";
import { Plus } from "lucide-react";

const SummaryCard: React.FC<{
  value: string;
  label: string;
  sub: string;
  positive?: boolean;
}> = ({ value, label, sub, positive = true }) => (
  <Card className="bg-white">
    <CardContent className="p-6">
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-sm ${positive ? "text-green-600" : "text-red-600"}`}>
        {sub}
      </p>
    </CardContent>
  </Card>
);

export const ValidatorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, getValidators } = useValidator();
  const { paginatedValidators, isLoading } = state;

  const [filters, setFilters] = useState<ValidatorFilters>({
    page: 1,
    limit: 20,
    status: undefined,
  });

  useEffect(() => {
    getValidators(filters);
  }, [filters, getValidators]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateClick = () => {
    navigate("/validators/create");
  };

  const totalValidators = paginatedValidators?.total || 0;
  const activeValidators =
    paginatedValidators?.validators.filter((v) => v.is_active).length || 0;
  const inactiveValidators =
    paginatedValidators?.validators.filter((v) => !v.is_active).length || 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <SummaryCard
          value={totalValidators.toString()}
          label="Total Validators"
          sub={`${activeValidators} active`}
        />
        <SummaryCard
          value={activeValidators.toString()}
          label="Active"
          sub={`${inactiveValidators} inactive`}
        />
        <SummaryCard
          value={inactiveValidators.toString()}
          label="Inactive"
          sub={`${totalValidators - inactiveValidators} active`}
          positive={false}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Validators
          </h2>
          <Button onClick={handleCreateClick} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Validator
          </Button>
        </div>
        <ValidatorList
          validators={paginatedValidators}
          filters={filters}
          isLoading={isLoading}
          error={state.error}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

