import { useEffect, useMemo } from 'react';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import {
  mapMaterialToFormValues,
  materialDefaultValues,
  MaterialForm,
  useMaterialForm,
} from '../components/material-form.generated';
import { MATERIAL_GROUPS_MOCK } from '../data/material-groups.mock';
import { SPEC_DEFINITIONS_MOCK } from '../data/spec-definitions.mock';
import { SPEC_VALUE_SETS_MOCK } from '../data/spec-value-sets.mock';
import { filterModelsByGroup } from '../lib/filter-models-by-group';
import {
  buildMaterialSpecValues,
  legacyGroupFromModelGroupId,
  validateMaterialSpecValues,
} from '../lib/material-device';
import type { MaterialFormValues } from '../material.schema';
import type { Material } from '../model/material';
import type { MaterialGroup } from '../model/material-group';
import {
  nextMaterialId,
  useMaterialCatalogStore,
} from '../stores/material-catalog.store';

export function MaterialEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { materials, materialModels, upsertMaterial } =
    useMaterialCatalogStore();
  const editing = id
    ? (materials.find((material) => material.id === id) ?? null)
    : null;
  const isEdit = Boolean(id);
  const form = useMaterialForm();
  const watchedGroupId = form.watch('groupId');
  const watchedModelId = form.watch('modelId');

  const modelById = useMemo(
    () => new Map(materialModels.map((model) => [model.id, model])),
    [materialModels],
  );
  const groupNameById = useMemo(
    () => new Map(MATERIAL_GROUPS_MOCK.map((group) => [group.id, group.name])),
    [],
  );
  const groupIdOptions = useMemo(
    () =>
      MATERIAL_GROUPS_MOCK.map((group) => ({
        value: group.id,
        label: `${'— '.repeat(depthOf(MATERIAL_GROUPS_MOCK, group.id))}${group.name}`,
      })),
    [],
  );
  const modelIdOptions = useMemo(
    () =>
      filterModelsByGroup(
        materialModels,
        MATERIAL_GROUPS_MOCK,
        watchedGroupId || null,
      ).map((model) => ({
        value: model.id,
        label: `${model.name} · ${groupNameById.get(model.groupId) ?? '—'}`,
      })),
    [groupNameById, materialModels, watchedGroupId],
  );
  const selectedModel = watchedModelId
    ? modelById.get(watchedModelId)
    : undefined;

  useEffect(() => {
    if (editing) {
      const model = modelById.get(editing.modelId);
      form.reset({
        ...mapMaterialToFormValues(editing),
        groupId: model?.groupId ?? '',
      });
      return;
    }
    form.reset(materialDefaultValues);
  }, [editing, form]);

  const handleGroupChange = () => {
    form.setValue('modelId', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('specValues', [], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = (values: MaterialFormValues) => {
    const model = modelById.get(values.modelId);
    if (!model) {
      toast.error('Chọn mẫu hợp lệ trước khi lưu');
      return;
    }

    const missingSpecs = validateMaterialSpecValues(
      model,
      values.specValues,
      SPEC_DEFINITIONS_MOCK,
      SPEC_VALUE_SETS_MOCK,
    );
    if (missingSpecs.length > 0) {
      toast.error(`Nhập thông số bắt buộc: ${missingSpecs.join(', ')}`);
      return;
    }

    const next: Material = {
      id: editing?.id ?? nextMaterialId(),
      name: values.name.trim(),
      code: values.code.trim(),
      imageUrl: editing?.imageUrl ?? model.imageUrls[0] ?? '',
      group: legacyGroupFromModelGroupId(model.groupId),
      modelId: model.id,
      specValues: buildMaterialSpecValues(
        model,
        values.specValues,
        SPEC_DEFINITIONS_MOCK,
        SPEC_VALUE_SETS_MOCK,
      ),
      tags: editing?.tags ?? [],
    };

    upsertMaterial(next);
    toast.success(
      editing ? `Đã cập nhật "${next.name}"` : `Đã thêm "${next.name}"`,
    );
    navigate(ROUTES.EXAMPLE.MATERIALS);
  };

  if (isEdit && !editing) {
    return (
      <div className="flex h-full min-h-0 flex-col p-6">
        <Card>
          <CardHeader>
            <CardHeading>
              <CardTitle>Không tìm thấy thiết bị</CardTitle>
              <CardDescription>
                Thiết bị đã bị xóa hoặc mã truy cập không hợp lệ.
              </CardDescription>
            </CardHeading>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to={ROUTES.EXAMPLE.MATERIALS}>
                <ArrowLeft className="size-4" />
                Quay lại danh sách
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-6">
      <div className="flex shrink-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="outline" mode="icon" size="sm" asChild>
              <Link
                to={ROUTES.EXAMPLE.MATERIALS}
                aria-label="Quay lại danh sách vật tư"
              >
                <ArrowLeft />
              </Link>
            </Button>
            <h1 className="truncate text-lg font-semibold leading-none text-foreground">
              {editing ? 'Sửa thiết bị' : 'Thêm thiết bị'}
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Thông tin cơ bản và thông số kế thừa từ mẫu
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button asChild type="button" variant="outline">
            <Link to={ROUTES.EXAMPLE.MATERIALS}>Hủy</Link>
          </Button>
          <Button type="submit" variant="primary" form="material-page-form">
            <Save />
            Lưu thiết bị
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card p-5">
        <div className="max-w-5xl">
          <MaterialForm
            form={form}
            onSubmit={handleSubmit}
            id="material-page-form"
            groupIdOptions={groupIdOptions}
            modelIdOptions={modelIdOptions}
            selectedModel={selectedModel}
            definitions={SPEC_DEFINITIONS_MOCK}
            valueSets={SPEC_VALUE_SETS_MOCK}
            onGroupChange={handleGroupChange}
          />
        </div>
      </div>
    </div>
  );
}

function depthOf(groups: MaterialGroup[], id: string): number {
  const byId = new Map(groups.map((group) => [group.id, group]));
  let depth = 0;
  let current = byId.get(id);
  while (current?.parentId) {
    depth += 1;
    current = byId.get(current.parentId);
  }
  return depth;
}
