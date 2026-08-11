import { useState } from 'react';
import {
  DEFAULT_LAYOUT_AREA_SIZE,
  layoutAreaSizeOptions,
  type LayoutAreaHeight,
  type LayoutAreaSize,
} from '@/builders/layout/layout-area-size-options';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentLayout } from '@/components/layouts/content-layout';

export function ContentLayoutsPage() {
  const [navigationSize, setNavigationSize] = useState<LayoutAreaSize>(
    DEFAULT_LAYOUT_AREA_SIZE,
  );
  const [navigationHeight, setNavigationHeight] =
    useState<LayoutAreaHeight>('fit');
  const [contentHeight, setContentHeight] = useState<LayoutAreaHeight>('fit');
  const [isNavigationResizable, setIsNavigationResizable] = useState(false);
  const [navigationMinSize, setNavigationMinSize] =
    useState<LayoutAreaSize>('sm');
  const [navigationMaxSize, setNavigationMaxSize] =
    useState<LayoutAreaSize>('xl');

  const widthRemBySize = (value: LayoutAreaSize) =>
    layoutAreaSizeOptions.find((option) => option.value === value)?.widthRem ??
    0;

  const handleMinSizeChange = (value: LayoutAreaSize) => {
    setNavigationMinSize(value);
    if (widthRemBySize(value) > widthRemBySize(navigationMaxSize)) {
      setNavigationMaxSize(value);
    }
  };

  const handleMaxSizeChange = (value: LayoutAreaSize) => {
    setNavigationMaxSize(value);
    if (widthRemBySize(value) < widthRemBySize(navigationMinSize)) {
      setNavigationMinSize(value);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <div className="mb-5 shrink-0">
        <h1 className="text-xl font-bold text-foreground">Content layouts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Các mẫu bố cục cho vùng nội dung bên trong trang.
        </p>
      </div>

      <ContentLayout
        navigationSize={navigationSize}
        navigationMinSize={navigationMinSize}
        navigationMaxSize={navigationMaxSize}
        navigationHeight={navigationHeight}
        contentHeight={contentHeight}
        navigationResizable={isNavigationResizable}
        navigation={
          <Card
            className={cn(
              'h-fit',
              navigationHeight === 'fill' && 'flex h-full min-h-0 flex-col',
            )}
          >
            <CardContent
              className={cn(
                'space-y-4',
                navigationHeight === 'fill' && 'min-h-0 flex-1',
              )}
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="content-layout-navigation-size"
                  className="text-sm font-medium text-foreground"
                >
                  Kích thước vùng điều hướng
                </label>
                <Select
                  value={navigationSize}
                  onValueChange={(value) =>
                    setNavigationSize(value as LayoutAreaSize)
                  }
                >
                  <SelectTrigger id="content-layout-navigation-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutAreaSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="content-layout-navigation-height"
                  checked={navigationHeight === 'fill'}
                  onCheckedChange={(checked) =>
                    setNavigationHeight(checked === true ? 'fill' : 'fit')
                  }
                  size="sm"
                />
                <div className="space-y-0.5">
                  <label
                    htmlFor="content-layout-navigation-height"
                    className="text-sm font-medium text-foreground"
                  >
                    Đầy chiều cao
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Kéo vùng navigation theo toàn bộ chiều cao layout.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="content-layout-navigation-resizable"
                  checked={isNavigationResizable}
                  onCheckedChange={(checked) =>
                    setIsNavigationResizable(checked === true)
                  }
                  size="sm"
                />
                <div className="space-y-0.5">
                  <label
                    htmlFor="content-layout-navigation-resizable"
                    className="text-sm font-medium text-foreground"
                  >
                    Cho phép thay đổi kích thước
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Kéo mép phải của vùng này để tùy chỉnh width.
                  </p>
                </div>
              </div>
              {isNavigationResizable && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SizeSelect
                    label="Width tối thiểu"
                    value={navigationMinSize}
                    onValueChange={handleMinSizeChange}
                  />
                  <SizeSelect
                    label="Width tối đa"
                    value={navigationMaxSize}
                    onValueChange={handleMaxSizeChange}
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Vùng điều hướng hoặc bộ lọc của trang.
              </p>
            </CardContent>
          </Card>
        }
        content={
          <LayoutArea
            description="Vùng nội dung chính để gắn các component được sinh từ builder."
            height={contentHeight}
            onHeightChange={setContentHeight}
          />
        }
      />
    </div>
  );
}

function LayoutArea({
  description,
  height = 'fit',
  onHeightChange,
  className,
}: {
  description: string;
  height?: LayoutAreaHeight;
  onHeightChange?: (value: LayoutAreaHeight) => void;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        className,
        height === 'fill' && 'flex h-full min-h-0 flex-1 flex-col',
      )}
    >
      <CardContent
        className={cn('space-y-4', height === 'fill' && 'min-h-0 flex-1')}
      >
        {onHeightChange && (
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="content-layout-content-height"
              checked={height === 'fill'}
              onCheckedChange={(checked) =>
                onHeightChange(checked === true ? 'fill' : 'fit')
              }
              size="sm"
            />
            <div className="space-y-0.5">
              <label
                htmlFor="content-layout-content-height"
                className="text-sm font-medium text-foreground"
              >
                Đầy chiều cao
              </label>
              <p className="text-xs text-muted-foreground">
                Cho phép nội dung sử dụng toàn bộ chiều cao layout.
              </p>
            </div>
          </div>
        )}
        <p
          className={cn(
            'text-sm text-muted-foreground',
            !onHeightChange &&
              'flex min-h-32 items-center justify-center text-center',
          )}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function SizeSelect({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: LayoutAreaSize;
  onValueChange: (value: LayoutAreaSize) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <Select
        value={value}
        onValueChange={(nextValue) =>
          onValueChange(nextValue as LayoutAreaSize)
        }
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {layoutAreaSizeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
