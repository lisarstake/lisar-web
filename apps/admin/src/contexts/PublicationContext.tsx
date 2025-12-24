import React, { createContext, useContext, useReducer, useCallback } from "react";
import { publicationService } from "@/services/publications";
import { BlogPost, BlogStats, CreateBlogPostData, UpdateBlogPostData, BlogCategory } from "@/types/blog";
import { PaginatedPublicationsResponse, GetPublicationsParams } from "@/services/publications/types";

interface PublicationState {
  publications: BlogPost[];
  currentPublication: BlogPost | null;
  paginatedPublications: PaginatedPublicationsResponse | null;
  publicationStats: BlogStats | null;
  categories: BlogCategory[];
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
}

type PublicationAction =
  | { type: "FETCH_PUBLICATIONS_REQUEST" }
  | { type: "FETCH_PUBLICATIONS_SUCCESS"; payload: PaginatedPublicationsResponse }
  | { type: "FETCH_PUBLICATIONS_FAILURE"; payload: string }
  | { type: "FETCH_PUBLICATION_REQUEST" }
  | { type: "FETCH_PUBLICATION_SUCCESS"; payload: BlogPost }
  | { type: "FETCH_PUBLICATION_FAILURE"; payload: string }
  | { type: "FETCH_STATS_REQUEST" }
  | { type: "FETCH_STATS_SUCCESS"; payload: BlogStats }
  | { type: "FETCH_STATS_FAILURE"; payload: string }
  | { type: "CREATE_PUBLICATION_SUCCESS"; payload: BlogPost }
  | { type: "UPDATE_PUBLICATION_SUCCESS"; payload: BlogPost }
  | { type: "DELETE_PUBLICATION_SUCCESS"; payload: string }
  | { type: "FETCH_CATEGORIES_SUCCESS"; payload: BlogCategory[] }
  | { type: "CREATE_CATEGORY_SUCCESS"; payload: BlogCategory }
  | { type: "UPDATE_CATEGORY_SUCCESS"; payload: BlogCategory }
  | { type: "CLEAR_ERROR" };

const initialState: PublicationState = {
  publications: [],
  currentPublication: null,
  paginatedPublications: null,
  publicationStats: null,
  categories: [],
  isLoading: false,
  isLoadingStats: false,
  error: null,
};

const publicationReducer = (
  state: PublicationState,
  action: PublicationAction
): PublicationState => {
  switch (action.type) {
    case "FETCH_PUBLICATIONS_REQUEST":
      return { ...state, isLoading: true, error: null };
    case "FETCH_PUBLICATIONS_SUCCESS":
      return {
        ...state,
        isLoading: false,
        paginatedPublications: action.payload,
        publications: action.payload.posts,
      };
    case "FETCH_PUBLICATIONS_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
      
    case "FETCH_PUBLICATION_REQUEST":
      return { ...state, isLoading: true, error: null };
    case "FETCH_PUBLICATION_SUCCESS":
      return {
        ...state,
        isLoading: false,
        currentPublication: action.payload,
      };
    case "FETCH_PUBLICATION_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
      
    case "FETCH_STATS_REQUEST":
      return { ...state, isLoadingStats: true, error: null };
    case "FETCH_STATS_SUCCESS":
      return {
        ...state,
        isLoadingStats: false,
        publicationStats: action.payload,
      };
    case "FETCH_STATS_FAILURE":
      return { ...state, isLoadingStats: false, error: action.payload };
      
    case "CREATE_PUBLICATION_SUCCESS":
      return {
        ...state,
        publications: [action.payload, ...state.publications],
      };
    case "UPDATE_PUBLICATION_SUCCESS":
      return {
        ...state,
        publications: state.publications.map((pub) =>
          pub.id === action.payload.id ? action.payload : pub
        ),
        currentPublication:
          state.currentPublication?.id === action.payload.id
            ? action.payload
            : state.currentPublication,
      };
    case "DELETE_PUBLICATION_SUCCESS":
      return {
        ...state,
        publications: state.publications.filter((pub) => pub.id !== action.payload),
      };
      
    case "FETCH_CATEGORIES_SUCCESS":
      return {
        ...state,
        categories: action.payload,
      };
    case "CREATE_CATEGORY_SUCCESS":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case "UPDATE_CATEGORY_SUCCESS":
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };
      
    case "CLEAR_ERROR":
      return { ...state, error: null };
      
    default:
      return state;
  }
};

interface PublicationContextValue {
  state: PublicationState;
  getPublications: (params: GetPublicationsParams) => Promise<void>;
  getPublicationById: (id: string) => Promise<void>;
  createPublication: (data: CreateBlogPostData) => Promise<BlogPost>;
  updatePublication: (data: UpdateBlogPostData) => Promise<BlogPost>;
  deletePublication: (id: string) => Promise<void>;
  togglePublicationStatus: (id: string, currentStatus: string) => Promise<void>;
  getPublicationStats: () => Promise<void>;
  getCategories: () => Promise<void>;
  createCategory: (data: { name: string; slug: string; description?: string }) => Promise<BlogCategory>;
  updateCategory: (id: string, data: { name: string; slug: string; description?: string }) => Promise<BlogCategory>;
  clearError: () => void;
}

const PublicationContext = createContext<PublicationContextValue | undefined>(
  undefined
);

export const PublicationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(publicationReducer, initialState);

  const getPublications = useCallback(async (params: GetPublicationsParams) => {
    dispatch({ type: "FETCH_PUBLICATIONS_REQUEST" });
    try {
      const response = await publicationService.getPublications(params);
      
      if (response.success && response.data) {
        dispatch({ type: "FETCH_PUBLICATIONS_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "FETCH_PUBLICATIONS_FAILURE",
          payload: response.error || response.message || "Failed to fetch publications",
        });
      }
    } catch (error) {
      dispatch({
        type: "FETCH_PUBLICATIONS_FAILURE",
        payload: error instanceof Error ? error.message : "Failed to fetch publications",
      });
    }
  }, []);

  const getPublicationById = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_PUBLICATION_REQUEST" });
    try {
      const response = await publicationService.getPublicationById(id);
      if (response.success && response.data) {
        dispatch({ type: "FETCH_PUBLICATION_SUCCESS", payload: response.data });
      } else {
        dispatch({
          type: "FETCH_PUBLICATION_FAILURE",
          payload: response.error || response.message || "Failed to fetch publication",
        });
      }
    } catch (error) {
      dispatch({
        type: "FETCH_PUBLICATION_FAILURE",
        payload: error instanceof Error ? error.message : "Failed to fetch publication",
      });
    }
  }, []);

  const createPublication = useCallback(async (data: CreateBlogPostData): Promise<BlogPost> => {
    try {
      const response = await publicationService.createPublication(data);
      if (response.success && response.data) {
        dispatch({ type: "CREATE_PUBLICATION_SUCCESS", payload: response.data });
        return response.data;
      } else {
        throw new Error(response.error || response.message || "Failed to create publication");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const updatePublication = useCallback(async (data: UpdateBlogPostData): Promise<BlogPost> => {
    try {
      const response = await publicationService.updatePublication(data);
      if (response.success && response.data) {
        dispatch({ type: "UPDATE_PUBLICATION_SUCCESS", payload: response.data });
        return response.data;
      } else {
        throw new Error(response.error || response.message || "Failed to update publication");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const deletePublication = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await publicationService.deletePublication(id);
      if (response.success) {
        dispatch({ type: "DELETE_PUBLICATION_SUCCESS", payload: id });
      } else {
        throw new Error(response.error || response.message || "Failed to delete publication");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const togglePublicationStatus = useCallback(async (id: string, currentStatus: string): Promise<void> => {
    try {
      // Toggle between published and archived
      const newStatus = currentStatus === "published" ? "archived" : "published";
      
      const updateData: UpdateBlogPostData = {
        id,
        status: newStatus as "draft" | "published" | "archived",
      };

      const response = await publicationService.updatePublication(updateData);
      if (response.success && response.data) {
        dispatch({ type: "UPDATE_PUBLICATION_SUCCESS", payload: response.data });
      } else {
        throw new Error(response.error || response.message || "Failed to toggle publication status");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const getPublicationStats = useCallback(async () => {
    dispatch({ type: "FETCH_STATS_REQUEST" });
    try {
      const response = await publicationService.getPublicationStats();
      
      if (response.success && response.data) {
        // API returns stats directly (not wrapped in a stats property)
        const statsData = response.data;
        dispatch({ type: "FETCH_STATS_SUCCESS", payload: statsData });
      } else {
        dispatch({
          type: "FETCH_STATS_FAILURE",
          payload: response.error || response.message || "Failed to fetch stats",
        });
      }
    } catch (error) {
      dispatch({
        type: "FETCH_STATS_FAILURE",
        payload: error instanceof Error ? error.message : "Failed to fetch stats",
      });
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      const response = await publicationService.getCategories();
      if (response.success && response.data) {
        dispatch({ type: "FETCH_CATEGORIES_SUCCESS", payload: response.data });
      } else {
        // Error handled silently
      }
    } catch (error) {
      // Error handled silently
    }
  }, []);

  const createCategory = useCallback(async (data: { name: string; slug: string; description?: string }): Promise<BlogCategory> => {
    try {
      const response = await publicationService.createCategory(data);
      if (response.success && response.data) {
        dispatch({ type: "CREATE_CATEGORY_SUCCESS", payload: response.data });
        return response.data;
      } else {
        throw new Error(response.error || response.message || "Failed to create category");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: { name: string; slug: string; description?: string }): Promise<BlogCategory> => {
    try {
      const response = await publicationService.updateCategory(id, data);
      if (response.success && response.data) {
        dispatch({ type: "UPDATE_CATEGORY_SUCCESS", payload: response.data });
        return response.data;
      } else {
        throw new Error(response.error || response.message || "Failed to update category");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <PublicationContext.Provider
      value={{
        state,
        getPublications,
        getPublicationById,
        createPublication,
        updatePublication,
        deletePublication,
        togglePublicationStatus,
        getPublicationStats,
        getCategories,
        createCategory,
        updateCategory,
        clearError,
      }}
    >
      {children}
    </PublicationContext.Provider>
  );
};

export const usePublication = () => {
  const context = useContext(PublicationContext);
  if (!context) {
    throw new Error("usePublication must be used within a PublicationProvider");
  }
  return context;
};

