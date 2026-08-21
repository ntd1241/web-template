import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUploadContent } from './file-upload-content';

function createDataTransfer(files: File[]) {
  return {
    files,
    items: files.map((file) => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
    types: ['Files'],
  };
}

describe('FileUploadContent', () => {
  it('accepts files dropped anywhere in the supplied management content', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    const file = new File(['contract'], 'contract.pdf', {
      type: 'application/pdf',
    });

    render(
      <FileUploadContent onUpload={onUpload}>
        <div data-testid="management-space">Khoảng trống quản lý file</div>
      </FileUploadContent>,
    );

    const dropzone = document.querySelector(
      '[data-slot="file-upload-dropzone"]',
    );
    const managementSpace = screen.getByTestId('management-space');
    expect(dropzone).toContainElement(managementSpace);

    await act(async () => {
      fireEvent.drop(managementSpace, {
        dataTransfer: createDataTransfer([file]),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('contract.pdf')).toBeInTheDocument();
      expect(
        screen.getByText('1 tệp đang chờ xác nhận tải lên'),
      ).toBeInTheDocument();
    });
    expect(onUpload).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận tải lên' }));
    });

    expect(onUpload).toHaveBeenCalledWith([file]);
  });
});
