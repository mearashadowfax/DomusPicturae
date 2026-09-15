/**
 * Descriptors → Zod schemas for Astro's content collections.
 *
 * `reference` is injected rather than imported from `astro:content` so this
 * module runs outside Astro (in tests) and the type of a relation still
 * resolves to Astro's typed reference.
 */
import { z } from "astro/zod";
import type { CollectionKey, reference as astroReference } from "astro:content";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type {
  ArrayField,
  CheckboxField,
  CollectionDescriptor,
  DateField,
  Field,
  ImageField,
  IntegerField,
  NameField,
  NumberField,
  ObjectField,
  RelationField,
  SelectField,
  Shape,
  SingletonDescriptor,
  TextField,
  UrlField,
} from "./fields";

type Reference<C extends string> = C extends CollectionKey
  ? ReturnType<typeof astroReference<C>>
  : z.ZodType<{ collection: C; id: string }>;

type Optional<R extends boolean, T extends z.ZodTypeAny> = R extends true
  ? T
  : z.ZodOptional<T>;

type LocalizedText<R extends boolean> = z.ZodObject<
  Record<Locale, Optional<R, z.ZodString>>
>;

/** The Zod type a descriptor produces; slug and body fields produce none. */
export type ZodFor<F> = F extends NameField
  ? z.ZodString
  : F extends TextField<infer L, infer R>
    ? L extends true
      ? LocalizedText<R>
      : Optional<R, z.ZodString>
    : F extends ImageField<infer R>
      ? Optional<R, z.ZodString>
      : F extends RelationField<infer C, infer R>
        ? Optional<R, Reference<C>>
        : F extends DateField<infer R>
          ? Optional<R, z.ZodDate>
          : F extends IntegerField<infer R>
            ? Optional<R, z.ZodNumber>
            : F extends NumberField<infer R, infer D>
              ? D extends number
                ? z.ZodDefault<z.ZodNumber>
                : Optional<R, z.ZodNumber>
              : F extends CheckboxField
                ? z.ZodDefault<z.ZodBoolean>
                : F extends SelectField<infer V>
                  ? z.ZodDefault<z.ZodEnum<{ [K in V]: K }>>
                  : F extends UrlField
                    ? z.ZodOptional<z.ZodString>
                    : F extends ObjectField<infer S>
                      ? z.ZodObject<ZodShape<S>>
                      : F extends ArrayField<infer S>
                        ? z.ZodDefault<z.ZodArray<z.ZodObject<ZodShape<S>>>>
                        : never;

export type ZodShape<S extends Shape> = {
  [K in keyof S as ZodFor<S[K]> extends never ? never : K]: ZodFor<S[K]>;
};

export interface ZodDeps {
  /** `reference` from `astro:content`. */
  reference: (collection: string) => z.ZodTypeAny;
}

function optional<T extends z.ZodTypeAny>(required: boolean, schema: T) {
  return required ? schema : schema.optional();
}

/**
 * One key per locale. When required, the default locale must be a non-empty
 * string (a missing English title fails the build); the others may be
 * missing or empty and fall back to it at render time.
 */
function localized(required: boolean) {
  return z.object(
    Object.fromEntries(
      locales.map((l) => [
        l,
        l === defaultLocale && required
          ? z.string().min(1)
          : z.string().optional(),
      ]),
    ),
  );
}

function fieldSchema(field: Field, deps: ZodDeps): z.ZodTypeAny | null {
  switch (field.kind) {
    case "slug":
    case "body":
      return null;
    case "name":
      return z.string();
    case "text":
      return field.localized
        ? localized(field.required)
        : optional(field.required, z.string());
    case "image":
      return optional(field.required, z.string());
    case "relation":
      return optional(field.required, deps.reference(field.collection));
    case "date":
      return optional(field.required, z.coerce.date());
    case "integer":
      return optional(field.required, z.number().int());
    case "number":
      return field.defaultValue !== undefined
        ? z.number().default(field.defaultValue)
        : optional(field.required, z.number());
    case "checkbox":
      return z.boolean().default(field.defaultValue);
    case "select": {
      const values = field.options.map((o) => o.value) as [string, ...string[]];
      return z.enum(values).default(field.defaultValue);
    }
    case "url":
      return z.string().optional();
    case "object":
      return shapeSchema(field.fields, deps);
    case "array":
      return z.array(shapeSchema(field.of, deps)).default([]);
  }
}

function shapeSchema<S extends Shape>(
  shape: S,
  deps: ZodDeps,
): z.ZodObject<ZodShape<S>> {
  const entries = Object.entries(shape)
    .map(([key, field]) => [key, fieldSchema(field, deps)] as const)
    .filter(
      (entry): entry is readonly [string, z.ZodTypeAny] => entry[1] !== null,
    );
  return z.object(Object.fromEntries(entries)) as unknown as z.ZodObject<
    ZodShape<S>
  >;
}

/** Schema for one collection or singleton. */
export function schemaFor<S extends Shape>(
  descriptor: CollectionDescriptor<S> | SingletonDescriptor<S>,
  deps: ZodDeps,
): z.ZodObject<ZodShape<S>> {
  return shapeSchema(descriptor.fields, deps);
}

/** Glob pattern (relative to `src/content/<name>`) matching a collection's entry files. */
export function entryPattern(
  descriptor: CollectionDescriptor | SingletonDescriptor,
): string {
  if (!("layout" in descriptor)) return "index.json";
  return descriptor.layout === "directory" ? "*/index.json" : "*.json";
}
