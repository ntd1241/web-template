import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTenantSavedView,
  deleteTenantSavedView,
  loadTenantSavedViews,
  updateTenantSavedView,
} from '../api/saved-views.api';
import type {
  SavedViewConfig,
  SavedViewResource,
  TenantSavedView,
} from '../model/saved-view';

interface UseTenantSavedViewsOptions {
  tenantId: string | null | undefined;
  userId: string | null | undefined;
  resource: SavedViewResource;
}

interface SaveTenantSavedViewInput<TFilters extends object> {
  name: string;
  view: TenantSavedView<TFilters> | null;
  config: SavedViewConfig<TFilters>;
}

export function useTenantSavedViews<TFilters extends object>({
  tenantId,
  userId,
  resource,
}: UseTenantSavedViewsOptions) {
  const queryClient = useQueryClient();
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const queryKey = ['project', 'saved-views', tenantId, resource] as const;

  const savedViewsQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      loadTenantSavedViews<TFilters>(tenantId!, resource, signal),
    enabled: Boolean(tenantId),
    staleTime: 60 * 1000,
  });

  const savedViews = savedViewsQuery.data ?? [];
  const activeView =
    savedViews.find((view) => view.id === activeViewId) ?? null;

  const invalidateSavedViews = () =>
    queryClient.invalidateQueries({ queryKey });

  const saveMutation = useMutation({
    mutationFn: async ({
      name,
      view,
      config,
    }: SaveTenantSavedViewInput<TFilters>) => {
      if (!tenantId || !userId) {
        throw new Error('Chưa xác định tenant hoặc tài khoản đăng nhập.');
      }

      return view
        ? updateTenantSavedView(tenantId, userId, view, name, config)
        : createTenantSavedView(tenantId, userId, resource, name, config);
    },
    onSuccess: async (view) => {
      setActiveViewId(view.id);
      await invalidateSavedViews();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (view: TenantSavedView<TFilters>) => {
      if (!tenantId) throw new Error('Chưa xác định tenant.');
      return deleteTenantSavedView(tenantId, view.id);
    },
    onSuccess: async (_, view) => {
      if (activeViewId === view.id) setActiveViewId(null);
      await invalidateSavedViews();
    },
  });

  return {
    savedViewsQuery,
    savedViews,
    activeViewId,
    setActiveViewId,
    activeView,
    saveMutation,
    deleteMutation,
    invalidateSavedViews,
  };
}

export type { SaveTenantSavedViewInput, UseTenantSavedViewsOptions };
