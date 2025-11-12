import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useValidator } from "@/contexts/ValidatorContext";
import { ValidatorFilters } from "@/services/validators/types";
import { ValidatorList } from "../../components/screens/ValidatorList";
import { Plus } from "lucide-react";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components/screens/SummaryCard";

export const ValidatorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, getValidators } = useValidator();
  const { paginatedValidators, isLoading } = state;

  const [filters, setFilters] = useState<ValidatorFilters>({
    page: 1,
    limit: 20,
    status: undefined,
  });

  // Fetch validators when filters change (including on mount)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Validators"
              subtitle={`${activeValidators} active`}
              value={totalValidators.toString()}
              color="green"
              isLoading={isLoading}
            />
            <SummaryCard
              title="Active"
              subtitle={`${inactiveValidators} inactive`}
              value={activeValidators.toString()}
              color="lime"
              isLoading={isLoading}
            />
            <SummaryCard
              title="Inactive"
              subtitle={`${totalValidators - inactiveValidators} active`}
              value={inactiveValidators.toString()}
              color="orange"
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-row items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Validators
          </h2>
          <Button size="lg" onClick={handleCreateClick} className="w-fit">
            <Plus className="w-4 h-4" />
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

