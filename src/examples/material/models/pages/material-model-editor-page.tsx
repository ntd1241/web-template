import { useEffect, useMemo } from 'react';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft } from 'lucide-react';
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
import { MATERIAL_GROUPS_MOCK } from '../../data/material-groups.mock';
import { SPEC_DEFINITIONS_MOCK } from '../../data/spec-definitions.mock';
import type { MaterialModel } from '../../model/material-model';
import {
  nextMaterialModelId,
  useMaterialCatalogStore,
} from '../../stores/material-catalog.store';
import {
  mapMaterialModelToFormValues,
  materialModelDefaultValues,
  useMaterialModelForm,
} from '../components/material-model-form.generated';
import { MaterialModelWizard } from '../components/material-model-wizard';
import type { MaterialModelFormValues } from '../material-model.schema';

export function MaterialModelEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { materialModels, upsertMaterialModel } = useMaterialCatalogStore();
  const editing = id
    ? (materialModels.find((model) => model.id === id) ?? null)
    : null;
  const isEdit = Boolean(id);
  const form = useMaterialModelForm();

  useEffect(() => {
    form.reset(
      editing
        ? mapMaterialModelToFormValues(editing)
        : materialModelDefaultValues,
    );
  }, [editing, form]);

  const groupOptions = useMemo(() => {
    const byId = new Map(
      MATERIAL_GROUPS_MOCK.map((group) => [group.id, group]),
    );
    const depthOf = (groupId: string): number => {
      let depth = 0;
      let current = byId.get(groupId);
      while (current?.parentId) {
        depth += 1;
        current = byId.get(current.parentId);
      }
      return depth;
    };

    return MATERIAL_GROUPS_MOCK.map((group) => ({
      value: group.id,
      label: `${'— '.repeat(depthOf(group.id))}${group.name}`,
    }));
  }, []);

  const handleSubmit = (values: MaterialModelFormValues) => {
    const next: MaterialModel = {
      id: editing?.id ?? nextMaterialModelId(),
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      origin: values.origin.trim() || undefined,
      groupId: values.groupId,
      imageUrls: values.imageUrls,
      specs: values.specs.map((spec, index) => ({
        specDefinitionId: spec.specDefinitionId,
        deviceMode: spec.deviceMode,
        modelValue: spec.modelValue,
        allowedOptionIds: spec.allowedOptionIds,
        dynamicOptions: spec.dynamicOptions,
        isRequired: spec.isRequired,
        sortOrder: index,
      })),
    };

    upsertMaterialModel(next);
    toast.success(
      editing ? `Đã cập nhật mẫu "${next.name}"` : `Đã thêm mẫu "${next.name}"`,
    );
    navigate(ROUTES.EXAMPLE.MATERIAL_MODELS);
  };

  if (isEdit && !editing) {
    return (
      <div className="flex h-full min-h-0 flex-col p-6">
        <Card>
          <CardHeader>
            <CardHeading>
              <CardTitle>Không tìm thấy mẫu vật tư</CardTitle>
              <CardDescription>
                Mẫu đã bị xóa hoặc mã truy cập không hợp lệ.
              </CardDescription>
            </CardHeading>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to={ROUTES.EXAMPLE.MATERIAL_MODELS}>
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
                to={ROUTES.EXAMPLE.MATERIAL_MODELS}
                aria-label="Quay lại danh sách mẫu vật tư"
              >
                <ArrowLeft />
              </Link>
            </Button>
            <h1 className="truncate text-lg font-semibold leading-none text-foreground">
              {editing ? 'Sửa mẫu vật tư' : 'Thêm mẫu vật tư'}
            </h1>
          </div>
        </div>
      </div>

      <MaterialModelWizard
        form={form}
        definitions={SPEC_DEFINITIONS_MOCK}
        groupOptions={groupOptions}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.EXAMPLE.MATERIAL_MODELS)}
        title={editing ? 'Sửa mẫu vật tư' : 'Thêm mẫu vật tư'}
      />
    </div>
  );
}
