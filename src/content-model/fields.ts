/**
 * Field descriptors: the one vocabulary the content model is written in.
 *
 * Each descriptor says what a field *is* (its kind, whether it is localised,
 * whether it is required) and how the admin should present it (label,
 * description, options). `zod.ts` turns descriptors into the schemas Astro
 * validates content with; `keystatic.ts` turns the same descriptors into the
 * admin UI. Neither side is written by hand.
 */

interface Base {
  label: string;
  description?: string;
}

export interface SlugField extends Base {
  kind: "slug";
}

/** A display name that also names the entry's file (Keystatic's slug field). */
export interface NameField extends Base {
  kind: "name";
}

export interface TextField<
  L extends boolean = boolean,
  R extends boolean = boolean,
> extends Base {
  kind: "text";
  localized: L;
  multiline: boolean;
  required: R;
}

/** A long-form Markdown body stored per locale in `body/<locale>.md`. */
export interface BodyField extends Base {
  kind: "body";
}

export interface ImageField<R extends boolean = boolean> extends Base {
  kind: "image";
  /** Folder under src/assets/images/ the admin uploads into. */
  directory: string;
  required: R;
}

export interface RelationField<
  C extends string = string,
  R extends boolean = boolean,
> extends Base {
  kind: "relation";
  collection: C;
  required: R;
}

export interface DateField<R extends boolean = boolean> extends Base {
  kind: "date";
  required: R;
}

export interface IntegerField<R extends boolean = boolean> extends Base {
  kind: "integer";
  required: R;
}

export interface NumberField<
  R extends boolean = boolean,
  D extends number | undefined = number | undefined,
> extends Base {
  kind: "number";
  required: R;
  defaultValue: D;
}

export interface CheckboxField extends Base {
  kind: "checkbox";
  defaultValue: boolean;
}

export interface SelectField<V extends string = string> extends Base {
  kind: "select";
  options: readonly { label: string; value: V }[];
  defaultValue: V;
}

export interface UrlField extends Base {
  kind: "url";
}

export interface ObjectField<S extends Shape = Shape> extends Base {
  kind: "object";
  fields: S;
  /** Column spans (out of 12) when the fields fit on one row. */
  layout?: number[];
}

export interface ArrayField<S extends Shape = Shape> extends Base {
  kind: "array";
  of: S;
  /** Key of the field whose value labels each item in the admin. */
  itemLabel: keyof S & string;
}

export type Field =
  | SlugField
  | NameField
  | TextField
  | BodyField
  | ImageField
  | RelationField
  | DateField
  | IntegerField
  | NumberField
  | CheckboxField
  | SelectField
  | UrlField
  | ObjectField
  | ArrayField;

export type Shape = Record<string, Field>;

interface TextOptions {
  multiline?: boolean;
  required?: boolean;
  description?: string;
}

/** `true` when an options object declares `required: true`, else `false`. */
type Required<O> = O extends { required: true } ? true : false;

/** Builders. Text is localised by default; `plain` opts out. */
export const field = {
  slug(
    description = "Lowercase letters, numbers and hyphens. Becomes part of the URL.",
  ): SlugField {
    return { kind: "slug", label: "Slug", description };
  },
  name(label: string): NameField {
    return { kind: "name", label };
  },
  text<const O extends TextOptions>(
    label: string,
    options?: O,
  ): TextField<true, Required<O>> {
    return {
      kind: "text",
      label,
      localized: true,
      multiline: options?.multiline ?? false,
      required: (options?.required ?? false) as Required<O>,
      description: options?.description,
    };
  },
  plain<const O extends TextOptions>(
    label: string,
    options?: O,
  ): TextField<false, Required<O>> {
    return { ...field.text(label, options), localized: false };
  },
  body(label = "Body"): BodyField {
    return { kind: "body", label };
  },
  image<const O extends { required?: boolean }>(
    label: string,
    directory: string,
    options?: O,
  ): ImageField<Required<O>> {
    return {
      kind: "image",
      label,
      directory,
      required: (options?.required ?? false) as Required<O>,
    };
  },
  /** Relations are required unless `{ required: false }` is passed. */
  relation<const C extends string, const O extends { required?: boolean }>(
    label: string,
    collection: C,
    options?: O,
  ): RelationField<C, O extends { required: false } ? false : true> {
    return {
      kind: "relation",
      label,
      collection,
      required: (options?.required ?? true) as O extends { required: false }
        ? false
        : true,
    };
  },
  /** Dates are required unless `{ required: false }` is passed. */
  date<const O extends { required?: boolean }>(
    label: string,
    options?: O,
  ): DateField<O extends { required: false } ? false : true> {
    return {
      kind: "date",
      label,
      required: (options?.required ?? true) as O extends { required: false }
        ? false
        : true,
    };
  },
  integer<const O extends { required?: boolean }>(
    label: string,
    options?: O,
  ): IntegerField<Required<O>> {
    return {
      kind: "integer",
      label,
      required: (options?.required ?? false) as Required<O>,
    };
  },
  number<
    const O extends {
      required?: boolean;
      defaultValue?: number;
      description?: string;
    },
  >(
    label: string,
    options?: O,
  ): NumberField<
    Required<O>,
    O extends { defaultValue: number } ? number : undefined
  > {
    return {
      kind: "number",
      label,
      required: (options?.required ?? false) as Required<O>,
      defaultValue: options?.defaultValue as O extends { defaultValue: number }
        ? number
        : undefined,
      description: options?.description,
    };
  },
  checkbox(
    label: string,
    options: { defaultValue?: boolean; description?: string } = {},
  ): CheckboxField {
    return {
      kind: "checkbox",
      label,
      defaultValue: options.defaultValue ?? false,
      description: options.description,
    };
  },
  select<const V extends string>(
    label: string,
    options: readonly { label: string; value: V }[],
    defaultValue: V,
    description?: string,
  ): SelectField<V> {
    return { kind: "select", label, options, defaultValue, description };
  },
  url(label: string, description?: string): UrlField {
    return { kind: "url", label, description };
  },
  object<S extends Shape>(
    label: string,
    fields: S,
    options: { layout?: number[] } = {},
  ): ObjectField<S> {
    return { kind: "object", label, fields, layout: options.layout };
  },
  array<S extends Shape>(
    label: string,
    of: S,
    itemLabel: keyof S & string,
    description?: string,
  ): ArrayField<S> {
    return { kind: "array", label, of, itemLabel, description };
  },
};

/** How a collection's entries are laid out on disk. */
export type EntryLayout =
  /** `src/content/<name>/<slug>.json` */
  | "file"
  /** `src/content/<name>/<slug>/index.json` plus `body/<locale>.md` */
  | "directory";

export interface CollectionDescriptor<S extends Shape = Shape> {
  label: string;
  layout: EntryLayout;
  /** Field that names the entry's file; `"slug"` unless a name field is used. */
  slugField: string;
  fields: S;
}

export interface SingletonDescriptor<S extends Shape = Shape> {
  label: string;
  fields: S;
}

export function collection<S extends Shape>(
  descriptor: Omit<CollectionDescriptor<S>, "slugField"> & {
    slugField?: keyof S & string;
  },
): CollectionDescriptor<S> {
  return { slugField: "slug", ...descriptor };
}

export function singleton<S extends Shape>(
  descriptor: SingletonDescriptor<S>,
): SingletonDescriptor<S> {
  return descriptor;
}
