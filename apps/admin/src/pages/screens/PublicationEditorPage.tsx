import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePublication } from "@/contexts/PublicationContext";
import { CreateBlogPostData, UpdateBlogPostData, BlogCategory } from "@/types/blog";
import { Eye, Upload, X, Pencil, Edit2, SquarePen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { CategoryDialog } from "@/components/ui/CategoryDialog";

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
    getPublications,
    createCategory,
    updateCategory,
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
    cover_image: "",
    category: "",
    tags: [],
    published_at: new Date().toISOString(),
    reading_time: 5,
    featured: false,
    status: "draft",
  });

  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [successDrawer, setSuccessDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [categoryDialog, setCategoryDialog] = useState({
    isOpen: false,
    category: null as BlogCategory | null,
  });

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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.cover_image && formData.cover_image.startsWith("blob:")) {
        URL.revokeObjectURL(formData.cover_image);
      }
      if (
        formData.author.avatar &&
        formData.author.avatar.startsWith("blob:")
      ) {
        URL.revokeObjectURL(formData.author.avatar);
      }
    };
  }, []);

  // Populate form with current publication data
  useEffect(() => {
    if (currentPublication && isEditMode) {
      setFormData({
        title: currentPublication.title,
        slug: currentPublication.slug,
        excerpt: currentPublication.excerpt,
        content: currentPublication.content,
        author: currentPublication.author,
        cover_image: currentPublication.cover_image,
        category: currentPublication.category,
        tags: currentPublication.tags,
        published_at: currentPublication.published_at.split("T")[0],
        reading_time: currentPublication.reading_time,
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

  const uploadImage = async (
    file: File,
    folder: string,
    setLoading: (loading: boolean) => void
  ): Promise<string | null> => {
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
      setLoading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("upload_preset", "lisar_profiles");
      formDataUpload.append("folder", folder);

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
      setLoading(false);
    }
  };

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    return uploadImage(file, "lisar-blog-covers", setIsUploadingCoverImage);
  };

  const uploadAuthorAvatar = async (file: File): Promise<string | null> => {
    return uploadImage(file, "lisar-author-avatars", setIsUploadingAvatar);
  };

  const handleUploadCoverImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert("Image size must be less than 5MB");
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please select a valid image file");
          return;
        }

        // Store file and create preview URL
        setCoverImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, cover_image: previewUrl }));
      }
    };
    input.click();
  };

  const handleUploadAuthorAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert("Image size must be less than 5MB");
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please select a valid image file");
          return;
        }

        // Store file and create preview URL
        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          author: { ...prev.author, avatar: previewUrl },
        }));
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      let coverImageUrl = formData.cover_image;
      let avatarUrl = formData.author.avatar;

      // Upload cover image if a new file was selected
      if (coverImageFile) {
        setIsUploadingCoverImage(true);
        try {
          const uploadedUrl = await uploadCoverImage(coverImageFile);
          if (uploadedUrl) {
            coverImageUrl = uploadedUrl;
            // Clean up preview URL
            if (formData.cover_image.startsWith("blob:")) {
              URL.revokeObjectURL(formData.cover_image);
            }
          } else {
            throw new Error("Failed to upload cover image");
          }
        } finally {
          setIsUploadingCoverImage(false);
        }
      }

      // Upload avatar if a new file was selected
      if (avatarFile) {
        setIsUploadingAvatar(true);
        try {
          const uploadedUrl = await uploadAuthorAvatar(avatarFile);
          if (uploadedUrl) {
            avatarUrl = uploadedUrl;
            // Clean up preview URL
            if (
              formData.author.avatar &&
              formData.author.avatar.startsWith("blob:")
            ) {
              URL.revokeObjectURL(formData.author.avatar);
            }
          } else {
            throw new Error("Failed to upload avatar");
          }
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Prepare data with uploaded URLs
      const dataToSubmit = {
        ...formData,
        cover_image: coverImageUrl,
        author: {
          ...formData.author,
          avatar: avatarUrl,
        },
        status: "published" as const,
        // Auto-generate published_at when publishing
        published_at: !isEditMode
          ? new Date().toISOString()
          : formData.published_at,
      };

      if (isEditMode && publicationId) {
        await updatePublication({ id: publicationId, ...dataToSubmit });
      } else {
        await createPublication(dataToSubmit);
      }

      // Clear file references
      setCoverImageFile(null);
      setAvatarFile(null);

      // Refresh publications list
      try {
        await getPublications({ page: 1, limit: 10 });
      } catch (refreshError) {
        console.warn("Failed to refresh publications list:", refreshError);
        // Continue with navigation even if refresh fails
      }

      // Show success drawer and navigate
      setSuccessDrawer({
        isOpen: true,
        title: isEditMode ? "Publication Updated!" : "Publication Created!",
        message: isEditMode 
          ? "Your publication has been successfully updated and published."
          : "Your publication has been successfully created and published.",
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Failed to save publication:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      setErrorDrawer({
        isOpen: true,
        title: "Publication Failed",
        message: errorMessage,
      });
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
              {formData.cover_image ? (
                <div className="relative">
                  <img
                    src={formData.cover_image}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Clean up preview URL if it's a blob URL
                      if (formData.cover_image.startsWith("blob:")) {
                        URL.revokeObjectURL(formData.cover_image);
                      }
                      setCoverImageFile(null);
                      setFormData((prev) => ({ ...prev, cover_image: "" }));
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadCoverImage}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Click to upload cover image
                  </span>
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
                rows={10}
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
            {/* <h3 className="font-semibold text-gray-900">Publishing Details</h3> */}

            {/* Author Avatar Upload */}
            <div>
              <Label className="mb-2">Author Avatar</Label>
              {formData.author.avatar ? (
                <div className="relative">
                  <img
                    src={formData.author.avatar}
                    alt="Author Avatar"
                    className="w-full h-24 object-cover rounded-lg cursor-pointer"
                    onClick={handleUploadAuthorAvatar}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Clean up preview URL if it's a blob URL
                      if (
                        formData.author.avatar &&
                        formData.author.avatar.startsWith("blob:")
                      ) {
                        URL.revokeObjectURL(formData.author.avatar);
                      }
                      setAvatarFile(null);
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, avatar: "" },
                      }));
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Remove avatar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadAuthorAvatar}
                  className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Click to upload avatar
                  </span>
                </button>
              )}
            </div>

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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="category">
                  Category *
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.category) {
                      // Edit selected category
                      const selectedCategory = categories.find(
                        (cat) => cat.name === formData.category
                      );
                      if (selectedCategory) {
                        setCategoryDialog({ isOpen: true, category: selectedCategory });
                      }
                    } else {
                      // Create new category
                      setCategoryDialog({ isOpen: true, category: null });
                    }
                  }}
                  className="text-[#235538] hover:text-[#1a4029] transition-colors"
                  title={formData.category ? "Edit selected category" : "Create new category"}
                >
                  <SquarePen className="w-4 h-4" />
                </button>
              </div>
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
              <Label htmlFor="reading_time" className="mb-2">
                Reading Time (minutes) *
              </Label>
              <Input
                id="reading_time"
                type="number"
                value={formData.reading_time}
                onChange={(e) =>
                  handleInputChange("reading_time", parseInt(e.target.value))
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
            <Button
              onClick={handleSubmit}
              size={"lg"}
              disabled={isSaving || isUploadingCoverImage || isUploadingAvatar}
              className="w-full bg-[#235538] hover:bg-[#1a4029] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving || isUploadingCoverImage || isUploadingAvatar ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={successDrawer.isOpen}
        onClose={() => setSuccessDrawer({ ...successDrawer, isOpen: false })}
        title={successDrawer.title}
        message={successDrawer.message}
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => setErrorDrawer({ ...errorDrawer, isOpen: false })}
        title={errorDrawer.title}
        message={errorDrawer.message}
      />

      {/* Category Dialog */}
      <CategoryDialog
        isOpen={categoryDialog.isOpen}
        onClose={() => setCategoryDialog({ isOpen: false, category: null })}
        onSave={async (data) => {
          try {
            if (categoryDialog.category) {
              // Update existing category
              await updateCategory(categoryDialog.category.id, data);
            } else {
              // Create new category
              const newCategory = await createCategory(data);
              // Auto-select the newly created category
              setFormData((prev) => ({ ...prev, category: newCategory.name }));
            }
            // Refresh categories list
            await getCategories();
          } catch (error) {
            setErrorDrawer({
              isOpen: true,
              title: categoryDialog.category ? "Update Failed" : "Create Failed",
              message: error instanceof Error ? error.message : "Failed to save category",
            });
            throw error;
          }
        }}
        category={categoryDialog.category}
        categories={categories}
      />
    </div>
  );
};
