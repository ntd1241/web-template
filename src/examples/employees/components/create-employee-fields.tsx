import { useState } from 'react';
import { vi } from 'date-fns/locale';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { CalendarDays } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { DateValue } from 'react-aria-components';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField, DateInput } from '@/components/ui/datefield';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  MultiSelect,
  type MultiSelectOption,
} from '@/components/ui/multi-select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUSES,
} from '../model/employee';
import {
  EMPLOYEE_DEPARTMENT_LABELS,
  EMPLOYEE_DEPARTMENTS,
  type CreateEmployeeFormValues,
} from '../schemas/employee-create.schema';
import { EmployeeAvatarDropzone } from './employee-avatar-dropzone';
import { EmployeeSkillsField } from './employee-skills-field';

const roleOptions: MultiSelectOption[] = EMPLOYEE_ROLES.map((role) => ({
  value: role,
  label: EMPLOYEE_ROLE_LABELS[role],
  searchableText: EMPLOYEE_ROLE_LABELS[role],
  group: 'Vai trò',
}));

function dateToCalendarDate(date: Date | null | undefined): CalendarDate | null {
  if (!date) {
    return null;
  }

  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

function dateValueToDate(value: DateValue | null): Date | undefined {
  return value?.toDate(getLocalTimeZone());
}

/** Dấu sao đỏ cho trường bắt buộc. */
function RequiredMark() {
  return <span className="text-destructive"> *</span>;
}

interface CreateEmployeeFieldsProps {
  avatar: File | null;
  onAvatarChange: (file: File | null) => void;
}

/** Toàn bộ các trường của form tạo nhân viên (thân cuộn của dialog). */
export function CreateEmployeeFields({
  avatar,
  onAvatarChange,
}: CreateEmployeeFieldsProps) {
  const form = useFormContext<CreateEmployeeFormValues>();
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);

  return (
    <div className="space-y-5 px-6 py-5">
      <EmployeeAvatarDropzone file={avatar} onChange={onAvatarChange} />

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Họ và tên
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input placeholder="Nhập họ và tên" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên đăng nhập
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input placeholder="vd: nguyen_van_a" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="ten@congty.vn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="vd: 0901234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phòng ban
                <RequiredMark />
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMPLOYEE_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {EMPLOYEE_DEPARTMENT_LABELS[dept]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => {
            const handleStartDateChange = (value: DateValue | null) => {
              field.onChange(dateValueToDate(value));
            };

            const handleStartDateSelect = (date: Date | undefined) => {
              if (!date) {
                return;
              }

              field.onChange(date);
              setIsStartDateOpen(false);
            };

            return (
              <FormItem>
                <FormLabel>
                  Ngày vào làm
                  <RequiredMark />
                </FormLabel>
                <FormControl>
                  <DateField
                    aria-label="Ngày vào làm"
                    className="flex w-full"
                    granularity="day"
                    locale="vi-VN"
                    value={dateToCalendarDate(field.value)}
                    onBlur={field.onBlur}
                    onChange={handleStartDateChange}
                  >
                    <DateInput className="rounded-e-none border-e-0" />
                    <Popover
                      open={isStartDateOpen}
                      onOpenChange={setIsStartDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          aria-label="Chọn ngày vào làm"
                          variant="outline"
                          mode="input"
                          className={cn(
                            'shrink-0 rounded-s-none px-2.5',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarDays />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={vi}
                          selected={field.value}
                          onSelect={handleStartDateSelect}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </DateField>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>

      <FormField
        control={form.control}
        name="roles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Vai trò
              <RequiredMark />
            </FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value}
                onChange={field.onChange}
                options={roleOptions}
                placeholder="Chọn vai trò"
                searchPlaceholder="Tìm vai trò..."
                emptyMessage="Không có vai trò phù hợp"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trạng thái ban đầu</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                {EMPLOYEE_STATUSES.map((status) => (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <RadioGroupItem value={status} />
                    {EMPLOYEE_STATUS_LABELS[status]}
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giới thiệu</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Mô tả ngắn về vị trí, kinh nghiệm..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kỹ năng</FormLabel>
            <FormControl>
              <EmployeeSkillsField
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <FormLabel className="text-foreground">
          Tùy chọn cấp tài khoản
        </FormLabel>

        <FormField
          control={form.control}
          name="sendInvite"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2.5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal text-foreground">
                Gửi email mời kích hoạt tài khoản
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canLoginNow"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2.5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal text-foreground">
                Cho phép đăng nhập ngay sau khi tạo
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
