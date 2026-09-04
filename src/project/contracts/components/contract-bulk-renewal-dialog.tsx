import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input, InputGroup } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ContractBulkRenewalInput,
  ContractRenewalDurationUnit,
} from '../api/contracts.api';
import type { Contract } from '../model/contract';
import { ContractBulkRenewalDialogShell } from './contract-bulk-renewal-dialog-shell.generated';

interface ContractBulkRenewalDialogProps {
  open: boolean;
  contracts: Contract[];
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: ContractBulkRenewalInput) => void | Promise<void>;
}

export function ContractBulkRenewalDialog({
  open,
  contracts,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: ContractBulkRenewalDialogProps) {
  const [durationValue, setDurationValue] = useState('12');
  const [durationUnit, setDurationUnit] =
    useState<ContractRenewalDurationUnit>('month');
  const [feeIncreasePercent, setFeeIncreasePercent] = useState('0');
  const [overrideConfirmOpen, setOverrideConfirmOpen] = useState(false);
  const [pendingInput, setPendingInput] =
    useState<ContractBulkRenewalInput | null>(null);

  const renewalDraftContracts = contracts.filter(
    (contract) => contract.hasRenewalDraft,
  );
  const parsedDuration = Number(durationValue);
  const parsedFeeIncreasePercent = Number(feeIncreasePercent);
  const canConfirm = Boolean(
    contracts.length > 0 &&
    Number.isInteger(parsedDuration) &&
    parsedDuration > 0 &&
    Number.isFinite(parsedFeeIncreasePercent) &&
    parsedFeeIncreasePercent >= 0,
  );

  useEffect(() => {
    if (!open) {
      setOverrideConfirmOpen(false);
      setPendingInput(null);
      return;
    }

    setDurationValue('12');
    setDurationUnit('month');
    setFeeIncreasePercent('0');
  }, [open, contracts]);

  function getInput(): ContractBulkRenewalInput | null {
    if (!canConfirm) return null;
    return {
      contractIds: contracts.map((contract) => contract.id),
      durationValue: parsedDuration,
      durationUnit,
      feeIncreasePercent: parsedFeeIncreasePercent,
    };
  }

  function handleConfirm() {
    if (isSubmitting) return;
    const input = getInput();
    if (!input) return;

    if (renewalDraftContracts.length > 0) {
      setPendingInput(input);
      setOverrideConfirmOpen(true);
      return;
    }

    void onConfirm(input);
  }

  return (
    <>
      <ContractBulkRenewalDialogShell
        open={open}
        onOpenChange={onOpenChange}
        dialogTitle={`Gia hạn ${contracts.length} hợp đồng`}
        isSubmitting={isSubmitting}
        canConfirm={canConfirm}
        onCancel={() => onOpenChange(false)}
        onConfirm={handleConfirm}
      >
        <div className="space-y-5">
          {renewalDraftContracts.length > 0 ? (
            <Alert variant="warning" appearance="light">
              <AlertIcon>
                <TriangleAlert />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>
                  Có {renewalDraftContracts.length} hợp đồng đang có bản nháp
                  gia hạn
                </AlertTitle>
                <AlertDescription>
                  <p>
                    Nếu tiếp tục, các bản nháp hiện tại sẽ được thay thế bằng
                    phiên bản gia hạn được kích hoạt ngay.
                  </p>
                  <div className="max-h-28 overflow-y-auto">
                    {renewalDraftContracts.map((contract) => (
                      <p key={contract.id}>
                        {contract.name} ({contract.contractCode})
                        {contract.renewalDraftVersionNo
                          ? ` · v${contract.renewalDraftVersionNo}`
                          : ''}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </AlertContent>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">
                Thời gian gia hạn
              </label>
              <InputGroup>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="rounded-e-none"
                  value={durationValue}
                  aria-label="Thời gian gia hạn"
                  onChange={(event) => setDurationValue(event.target.value)}
                />
                <Select
                  value={durationUnit}
                  onValueChange={(value) =>
                    setDurationUnit(value as ContractRenewalDurationUnit)
                  }
                >
                  <SelectTrigger
                    className="w-28 rounded-s-none border-s-0"
                    aria-label="Đơn vị thời gian gia hạn"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Ngày</SelectItem>
                    <SelectItem value="month">Tháng</SelectItem>
                    <SelectItem value="year">Năm</SelectItem>
                  </SelectContent>
                </Select>
              </InputGroup>
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="bulk-renewal-fee-increase"
              >
                Tăng tiền thu phí (%)
              </label>
              <Input
                id="bulk-renewal-fee-increase"
                type="number"
                min={0}
                step="0.01"
                value={feeIncreasePercent}
                onChange={(event) => setFeeIncreasePercent(event.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Phần trăm tăng sẽ áp dụng cho đơn giá các khoản thu; các khoản chi
            giữ nguyên.
          </p>
        </div>
      </ContractBulkRenewalDialogShell>

      <ConfirmDialog
        open={overrideConfirmOpen}
        onOpenChange={setOverrideConfirmOpen}
        title="Thay thế bản nháp và gia hạn ngay?"
        description={`Có ${renewalDraftContracts.length} bản nháp gia hạn sẽ bị xóa để kích hoạt phiên bản gia hạn mới ngay sau khi phiên bản hiện tại kết thúc.`}
        confirmLabel="Gia hạn và thay thế"
        onConfirm={() => {
          if (!pendingInput || isSubmitting) return;
          setOverrideConfirmOpen(false);
          setPendingInput(null);
          void onConfirm({ ...pendingInput, overrideDraft: true });
        }}
      />
    </>
  );
}
