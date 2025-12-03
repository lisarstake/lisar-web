import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePublication } from "@/contexts/PublicationContext";
import { CreateBlogPostData, UpdateBlogPostData } from "@/types/blog";
import { ArrowLeft, Save, Eye, Star, Upload, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const PublicationEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { publicationId } = useParams<{ publicationId: string }>();
  const isEditMode = !!publicationId;

  const {
    state,
    getPublicationById,
    createPublication,
    updatePublication,
    getCategories,
  } = usePublication();
  const { currentPublication, categories, isLoading } = state;

  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: {
      name: "",
      avatar: "",
      role: "",
    },
    coverImage: "",
    category: "",
    tags: [],
    publishedAt: new Date().toISOString(),
    readingTime: 5,
    featured: false,
    status: "draft",
  });

  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch categories
  useEffect(() => {
    if (categories.length === 0) {
      getCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch publication if in edit mode
  useEffect(() => {
    if (isEditMode && publicationId) {
      getPublicationById(publicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, publicationId]);

  // Populate form with current publication data
  useEffect(() => {
    if (currentPublication && isEditMode) {
      setFormData({
        title: currentPublication.title,
        slug: currentPublication.slug,
        excerpt: currentPublication.excerpt,
        content: currentPublication.content,
        author: currentPublication.author,
        coverImage: currentPublication.coverImage,
        category: currentPublication.category,
        tags: currentPublication.tags,
        publishedAt: currentPublication.publishedAt.split("T")[0],
        readingTime: currentPublication.readingTime,
        featured: currentPublication.featured,
        status: currentPublication.status || "draft",
      });
    }
  }, [currentPublication, isEditMode]);

  // Auto-generate slug from title
  useEffect(() => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  }, [formData.title]);

  const handleInputChange = (
    field: keyof CreateBlogPostData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuthorChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      author: { ...prev.author, [field]: value },
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return null;
    }

    try {
      setIsUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("upload_preset", "lisar_profiles");
      formDataUpload.append("folder", "lisar-blog-covers");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgz4c3ahz/image/upload",
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        alert("Failed to upload image");
        return null;
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadCoverImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = await uploadCoverImage(file);
        if (imageUrl) {
          setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
        }
      }
    };
    input.click();
  };

  const handleSubmit = async (status: "draft" | "published" | "archived") => {
    setIsSaving(true);
    try {
      const dataToSubmit = {
        ...formData,
        status,
        // Auto-generate publishedAt when publishing
        publishedAt:
          status === "published" && !isEditMode
            ? new Date().toISOString()
            : formData.publishedAt,
      };

      if (isEditMode && publicationId) {
        await updatePublication({ id: publicationId, ...dataToSubmit });
      } else {
        await createPublication(dataToSubmit);
      }

      navigate("/publications");
    } catch (error) {
      console.error("Failed to save publication:", error);
      alert("Failed to save publication. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235538]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Cover Image Upload */}
            <div>
              <Label className="mb-2">Cover Image *</Label>
              {formData.coverImage ? (
                <div className="relative">
                  <img
                    src={formData.coverImage}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, coverImage: "" }))
                    }
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadCoverImage}
                  disabled={isUploadingImage}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#235538]"></div>
                      <span className="text-sm text-gray-600">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        Click to upload cover image 
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="mb-2">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter publication title"
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt" className="mb-2">
                Excerpt *
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                placeholder="Brief description of the article"
                rows={3}
                required
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content" className="mb-2">
                Content * (Markdown supported)
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Write your article content in Markdown format..."
                rows={20}
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports Markdown formatting: **bold**, *italic*, ## headings,
                [links](url), etc.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Publishing Details</h3>

            {/* Author Name */}
            <div>
              <Label htmlFor="authorName" className="mb-2">
                Author Name *
              </Label>
              <Input
                id="authorName"
                value={formData.author.name}
                onChange={(e) => handleAuthorChange("name", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="mb-2">
                Category *
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reading Time */}
            <div>
              <Label htmlFor="readingTime" className="mb-2">
                Reading Time (minutes) *
              </Label>
              <Input
                id="readingTime"
                type="number"
                value={formData.readingTime}
                onChange={(e) =>
                  handleInputChange("readingTime", parseInt(e.target.value))
                }
                min={1}
                required
              />
            </div>

            {/* Featured */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  handleInputChange("featured", checked === true)
                }
              />
              <Label
                htmlFor="featured"
                className="cursor-pointer flex items-center gap-2"
              >
                Featured Article
              </Label>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Tags</h3>

            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag"
              />
              <Button onClick={handleAddTag} type="button" variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-full">
              <Button
                onClick={() => handleSubmit("draft")}
                disabled={isSaving}
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSubmit("published")}
                disabled={isSaving}
                className="bg-[#235538] hover:bg-[#1a4029]"
              >
                <Eye className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
