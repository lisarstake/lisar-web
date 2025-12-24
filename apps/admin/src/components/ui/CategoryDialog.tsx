import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlogCategory } from "@/types/blog";
import { X } from "lucide-react";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; slug: string; description?: string }) => Promise<void>;
  category?: BlogCategory | null;
  categories: BlogCategory[];
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  categories,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!category;

  // Generate slug from name
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
    } else {
      setName("");
      setDescription("");
    }
    setError("");
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate name
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    // Check for duplicate names (excluding current category if editing)
    const duplicate = categories.find(
      (cat) => cat.name.toLowerCase() === name.trim().toLowerCase() && cat.id !== category?.id
    );
    if (duplicate) {
      setError("A category with this name already exists");
      return;
    }

    // Generate slug from name
    const slug = generateSlug(name.trim());

    try {
      setIsSaving(true);
      await onSave({
        name: name.trim(),
        slug: slug,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category-name" className="mb-2">
              Category Name *
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Getting Started"
              required
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="category-description" className="mb-2">
              Description (Optional)
            </Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category"
              rows={3}
              disabled={isSaving}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#235538] hover:bg-[#1a4029]"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                isEditMode ? "Update Category" : "Create Category"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

