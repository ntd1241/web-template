import { z } from 'zod';

/**
 * Spec schema for the tree builder. The builder owns the presentational tree
 * shell and emits callback props for every action; business logic stays in the
 * screen that consumes the generated component.
 */

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;

const identifier = z.string().regex(IDENTIFIER, 'phải là một định danh hợp lệ');

const actionSchema = z.object({
  /** Stable action key; also drives the default callback name. */
  key: identifier,
  kind: z.enum(['add', 'edit', 'delete', 'custom']),
  label: z.string().min(1),
  /** Label used for the node action; defaults to `label`. */
  nodeLabel: z.string().min(1).optional(),
  /** Label used for the root/all-row action; defaults to `label`. */
  allLabel: z.string().min(1).optional(),
  /** Lucide icon export. Basic actions have sensible defaults. */
  icon: identifier.optional(),
  /** Callback prop; defaults to `on${PascalCase(key)}`. */
  callback: identifier.optional(),
  /** Optional callbacks render only when supplied by the screen. */
  optional: z.boolean().optional(),
  /** Where the action is rendered. Non-add actions are node-only. */
  scope: z.enum(['node', 'all', 'both']).optional(),
});

export const treeSpecSchema = z
  .object({
    /** Node type imported by the generated component. */
    entity: identifier,
    modelImport: z.string().min(1),
    componentName: identifier,
    panelComponentName: identifier.optional(),
    specPath: z.string().optional(),
    idField: identifier.default('id'),
    labelField: identifier.default('name'),
    depthField: identifier.default('depth'),
    childrenField: identifier.default('children'),
    includeAllRow: z.boolean().default(false),
    allLabel: z.string().min(1).default('Tất cả'),
    actions: z.array(actionSchema).default([]),
  })
  .superRefine((spec, ctx) => {
    const keys = new Set<string>();
    spec.actions.forEach((action, index) => {
      if (keys.has(action.key)) {
        ctx.addIssue({
          code: 'custom',
          message: `action key bị trùng: ${action.key}`,
          path: ['actions', index, 'key'],
        });
      }
      keys.add(action.key);

      if (action.kind === 'custom' && !action.icon) {
        ctx.addIssue({
          code: 'custom',
          message: 'custom action cần khai báo icon',
          path: ['actions', index, 'icon'],
        });
      }

      const scope = action.scope ?? (action.kind === 'add' ? 'both' : 'node');
      if (action.kind !== 'add' && scope !== 'node') {
        ctx.addIssue({
          code: 'custom',
          message: 'chỉ action add được hiển thị ở dòng Tất cả',
          path: ['actions', index, 'scope'],
        });
      }
    });

    if (
      spec.includeAllRow &&
      !spec.actions.some((action) => {
        const scope = action.scope ?? (action.kind === 'add' ? 'both' : 'node');
        return scope === 'all' || scope === 'both';
      })
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'includeAllRow cần ít nhất một action có scope all hoặc both',
        path: ['actions'],
      });
    }
  });

export type TreeActionSpec = z.infer<typeof actionSchema>;
export type TreeSpec = z.infer<typeof treeSpecSchema>;
