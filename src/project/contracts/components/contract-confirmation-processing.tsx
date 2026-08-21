import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  CircleAlert,
  FileCheck2,
  LoaderCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ContractVersionChangeCheck } from '../model/contract-version-change';

type ProcessingState = 'idle' | 'checking' | 'complete';

interface ContractConfirmationProcessingProps {
  state: ProcessingState;
  result: ContractVersionChangeCheck | null;
}

const resultCopy = {
  create: {
    title: 'Sẵn sàng tạo phiên bản khởi tạo',
    description: 'Hợp đồng mới sẽ được tạo cùng phiên bản đầu tiên.',
  },
  'keep-current': {
    title: 'Giữ nguyên phiên bản hiện tại',
    description:
      'Các thay đổi chỉ thuộc thông tin ngoài version, hệ thống không tạo version mới.',
  },
  'update-draft': {
    title: 'Cập nhật phiên bản nháp hiện tại',
    description:
      'Hợp đồng đang có version nháp nên hệ thống sẽ cập nhật trên version này.',
  },
  'create-new': {
    title: 'Sẽ tạo phiên bản mới',
    description:
      'Các thay đổi điều khoản sẽ được lưu thành version mới để bảo toàn lịch sử hợp đồng.',
  },
} as const;

export function ContractConfirmationProcessing({
  state,
  result,
}: ContractConfirmationProcessingProps) {
  const resultText = result ? resultCopy[result.action] : null;
  const isChecking = state === 'checking';

  return (
    <div className="grid min-h-[420px] items-center gap-12 py-10 lg:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.18fr)] lg:gap-16 lg:py-14">
      <div className="flex items-center justify-center px-6 lg:px-10">
        <div className="relative flex size-44 items-center justify-center">
          <div className="absolute size-36 rotate-[-8deg] rounded-3xl border border-primary/10 bg-primary/10" />
          <div className="absolute size-36 translate-x-3 translate-y-2 rotate-[7deg] rounded-3xl border border-border bg-background/80 shadow-sm" />
          <div className="relative flex size-28 items-center justify-center rounded-3xl bg-background shadow-lg ring-1 ring-primary/10">
            <FileCheck2 className="size-12 text-primary" strokeWidth={1.6} />
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 lg:px-0 lg:pr-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tiến trình xác nhận
        </p>
        <div className="relative mt-6 pl-1">
          <div className="relative flex gap-4">
            <div
              className={cn(
                'relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-transparent',
                isChecking
                  ? 'text-primary'
                  : state === 'complete'
                    ? 'text-success-foreground'
                    : 'text-muted-foreground',
              )}
            >
              {isChecking ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : state === 'complete' ? (
                <Check className="size-4" />
              ) : (
                <Circle className="size-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-3">
              <h3 className="font-medium text-foreground">
                Kiểm tra dữ liệu hợp đồng
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Đối chiếu thông tin và các khoản phí với phiên bản hiện tại.
              </p>

              {resultText && !isChecking ? (
                result?.action === 'create-new' ? (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <p className="font-medium text-foreground">
                      {resultText.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" appearance="light" size="lg">
                        v{result.previousVersionNo}
                      </Badge>
                      <ArrowRight className="size-4 text-muted-foreground" />
                      <Badge variant="primary" appearance="light" size="lg">
                        v{result.nextVersionNo}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 border-l-2 border-success/25 pl-4">
                    <div className="flex items-start gap-3">
                      {result?.requiresNewVersion ? (
                        <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success-foreground" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {resultText.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {resultText.description}
                        </p>
                        {result?.changedAreas.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {result.changedAreas.map((area) => (
                              <span
                                key={area}
                                className="text-xs font-medium text-warning-foreground"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
